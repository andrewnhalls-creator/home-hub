-- 038: Transactional outbox + activity-log hardening (backend slice B1.3)
-- APPLIED 2026-08-26 as remote migrations 038a_outbox_table,
-- 038b_outbox_functions_triggers, 038c_activity_log_hardening and
-- 038d_notification_events_source_key_full_unique (chunked for the MCP
-- permission classifier).
--
-- Foundation for all async side effects (notification delivery now; Google
-- Calendar sync, exports and recaps later):
-- - `outbox_jobs`: dedupe_key-unique job queue with atomic claim/lease
--   (`for update skip locked`), capped exponential backoff + jitter, explicit
--   deferral (quiet hours), terminal failure and cancellation. RLS enabled
--   with NO client policies — only the service role (worker) touches it.
-- - scheduled_notifications gains AFTER INSERT/DELETE triggers so every
--   producer (server actions, SQL scans) enrolls jobs in the SAME transaction
--   as the domain write — the transactional-outbox pattern with zero
--   producer-code changes.
-- - notification_events.source_key + unique index makes event creation
--   idempotent across job retries.
-- - activity_log: INSERT now requires actor_id = auth.uid(); UPDATE/DELETE
--   revoked at the grant level (RLS already had no policies for them).
-- Worker: supabase/functions/outbox-worker (cron every minute; replaces the
-- send-push "scheduled" cron — send-push stays deployed for its "test" mode).
-- Tests: supabase/tests/003_outbox.sql + tests/quiet-hours.test.ts.

-- ---------------------------------------------------------------------------
-- part a (038a): outbox table + notification_events idempotency
-- ---------------------------------------------------------------------------
create table if not exists public.outbox_jobs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  job_type text not null,
  dedupe_key text not null unique,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'done', 'failed', 'cancelled')),
  attempts integer not null default 0,
  max_attempts integer not null default 8,
  next_attempt_at timestamptz not null default now(),
  claimed_at timestamptz,
  claimed_by text,
  last_error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_outbox_jobs_claimable
  on public.outbox_jobs (next_attempt_at)
  where status in ('pending', 'processing');
create index if not exists idx_outbox_jobs_household_id
  on public.outbox_jobs (household_id);

-- Service-role only: RLS on, deliberately no policies for client roles.
alter table public.outbox_jobs enable row level security;
revoke all on public.outbox_jobs from anon, authenticated;

-- Idempotent in-app event creation across worker retries. The index is FULL
-- (not partial) because PostgREST upsert on_conflict cannot infer a partial
-- unique index (038d fixed this); NULLs are distinct, so legacy rows with
-- source_key null never conflict.
alter table public.notification_events
  add column if not exists source_key text;
create unique index if not exists idx_notification_events_user_source
  on public.notification_events (user_id, source_key);

-- ---------------------------------------------------------------------------
-- part b (038b): queue API + scheduled_notifications triggers
-- ---------------------------------------------------------------------------
-- Enqueue with dedupe. A dedupe_key hit on a cancelled/failed job revives it
-- (fresh attempts, new run time); pending/processing/done rows are untouched
-- so replays can never double-run a live or completed job.
create or replace function public.enqueue_outbox_job(
  p_job_type text,
  p_dedupe_key text,
  p_household_id uuid,
  p_payload jsonb default '{}'::jsonb,
  p_run_at timestamptz default now()
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.outbox_jobs (job_type, dedupe_key, household_id, payload, next_attempt_at)
  values (p_job_type, p_dedupe_key, p_household_id, coalesce(p_payload, '{}'::jsonb), coalesce(p_run_at, now()))
  on conflict (dedupe_key) do update
    set status = 'pending',
        attempts = 0,
        next_attempt_at = excluded.next_attempt_at,
        payload = excluded.payload,
        last_error = null,
        completed_at = null
    where outbox_jobs.status in ('cancelled', 'failed')
  returning id into v_id;
  return v_id;
end;
$$;

-- Atomic claim with lease: takes due pending jobs plus processing jobs whose
-- lease expired (crashed worker recovery). SKIP LOCKED keeps concurrent
-- workers from double-claiming.
create or replace function public.claim_outbox_jobs(
  p_worker text,
  p_limit integer default 10,
  p_lease_seconds integer default 120
)
returns setof public.outbox_jobs
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.outbox_jobs j
  set status = 'processing', claimed_at = now(), claimed_by = p_worker
  where j.id in (
    select o.id from public.outbox_jobs o
    where (o.status = 'pending' and o.next_attempt_at <= now())
       or (o.status = 'processing'
           and o.claimed_at < now() - make_interval(secs => p_lease_seconds))
    order by o.next_attempt_at
    limit p_limit
    for update skip locked
  )
  returning j.*;
end;
$$;

create or replace function public.complete_outbox_job(p_job_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.outbox_jobs
  set status = 'done', completed_at = now(), last_error = null
  where id = p_job_id and status = 'processing';
$$;

-- Failure with capped exponential backoff + jitter: 1min * 2^attempts capped
-- at 60min, plus 0–30s jitter. Terminal after max_attempts.
create or replace function public.fail_outbox_job(p_job_id uuid, p_error text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.outbox_jobs
  set attempts = attempts + 1,
      last_error = left(coalesce(p_error, 'error'), 500),
      status = case when attempts + 1 >= max_attempts then 'failed' else 'pending' end,
      completed_at = case when attempts + 1 >= max_attempts then now() else null end,
      next_attempt_at = now()
        + least(interval '60 minutes', interval '1 minute' * pow(2, attempts))
        + (random() * interval '30 seconds')
  where id = p_job_id and status = 'processing';
end;
$$;

-- Deliberate deferral (e.g. quiet hours): reschedules WITHOUT counting an
-- attempt, so repeated legitimate deferrals never exhaust the retry budget.
create or replace function public.defer_outbox_job(p_job_id uuid, p_defer_seconds integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.outbox_jobs
  set status = 'pending',
      next_attempt_at = now() + make_interval(secs => greatest(p_defer_seconds, 60))
  where id = p_job_id and status = 'processing';
$$;

-- Queue API is worker-only.
revoke execute on function public.enqueue_outbox_job(text, text, uuid, jsonb, timestamptz) from public, anon, authenticated;
revoke execute on function public.claim_outbox_jobs(text, integer, integer) from public, anon, authenticated;
revoke execute on function public.complete_outbox_job(uuid) from public, anon, authenticated;
revoke execute on function public.fail_outbox_job(uuid, text) from public, anon, authenticated;
revoke execute on function public.defer_outbox_job(uuid, integer) from public, anon, authenticated;
grant execute on function public.enqueue_outbox_job(text, text, uuid, jsonb, timestamptz) to service_role;
grant execute on function public.claim_outbox_jobs(text, integer, integer) to service_role;
grant execute on function public.complete_outbox_job(uuid) to service_role;
grant execute on function public.fail_outbox_job(uuid, text) to service_role;
grant execute on function public.defer_outbox_job(uuid, integer) to service_role;

-- Every scheduled notification enrolls a delivery job in the same transaction.
create or replace function public.enqueue_notification_delivery()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.enqueue_outbox_job(
    'deliver_notification',
    'notif:' || new.idempotency_key,
    new.household_id,
    jsonb_build_object('scheduled_notification_id', new.id),
    new.scheduled_for
  );
  return null;
end;
$$;
revoke execute on function public.enqueue_notification_delivery() from public, anon, authenticated;

drop trigger if exists enqueue_delivery on public.scheduled_notifications;
create trigger enqueue_delivery
  after insert on public.scheduled_notifications
  for each row execute function public.enqueue_notification_delivery();

-- Deleting a pending scheduled notification cancels its undelivered job.
create or replace function public.cancel_notification_delivery()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.outbox_jobs
  set status = 'cancelled', completed_at = now()
  where dedupe_key = 'notif:' || old.idempotency_key
    and status = 'pending';
  return null;
end;
$$;
revoke execute on function public.cancel_notification_delivery() from public, anon, authenticated;

drop trigger if exists cancel_delivery on public.scheduled_notifications;
create trigger cancel_delivery
  after delete on public.scheduled_notifications
  for each row execute function public.cancel_notification_delivery();

-- ---------------------------------------------------------------------------
-- part c (038c): activity_log hardening + cron switch
-- ---------------------------------------------------------------------------
-- INSERT must carry the real actor; UPDATE/DELETE were already impossible via
-- RLS (no policies) — the grant revoke adds a second layer.
drop policy if exists "activity_log_insert" on public.activity_log;
create policy "activity_log_insert" on public.activity_log
  for insert with check (
    public.is_household_member(household_id)
    and actor_id = (select auth.uid())
  );
revoke update, delete on public.activity_log from anon, authenticated;

-- Cron (EXECUTED operationally 2026-08-26, verified succeeding): the old
-- every-minute send-push job (jobid 1) was unscheduled and replaced by
-- 'outbox-worker-cron' (jobid 3, * * * * *) POSTing to
-- /functions/v1/outbox-worker with the client-safe publishable key as Bearer.
-- send-push remains deployed for its device-test mode only. The daily
-- document-expiry-scan (jobid 2) is unchanged and now enrolls outbox jobs via
-- the insert trigger automatically.
