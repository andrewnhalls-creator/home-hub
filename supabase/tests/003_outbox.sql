-- RLS/logic test 003: transactional outbox (backend slice B1.3)
-- Run via Supabase MCP `execute_sql` — one transaction, ROLLED BACK.
-- Covers: trigger enrollment from scheduled_notifications, cancellation on
-- delete, dedupe + revive semantics, atomic claim (no double-claim), lease
-- recovery, backoff on failure, terminal failure, attempt-free deferral, and
-- client isolation (RLS + EXECUTE grants + activity_log hardening).
-- NOTE: the delete-cancel test runs BEFORE any claim — cancellation only
-- targets pending jobs by design (a mid-flight job finishes and self-skips).

begin;
select extensions.plan(14);

create temp table state (k text primary key, v text);
grant all on state to public;
insert into state select 'hh', id::text from public.households limit 1;

-- 1: inserting a scheduled notification enrolls an outbox job transactionally.
insert into public.scheduled_notifications
  (household_id, user_id, category, scheduled_for, title, idempotency_key)
values ((select v from state where k='hh')::uuid, null, 'actividad_hogar',
        now(), 'TAP prueba', 'tap-outbox-1');
select extensions.is(
  (select status from public.outbox_jobs where dedupe_key = 'notif:tap-outbox-1'),
  'pending', 'insert trigger enqueued a pending job');

-- 2: deleting the scheduled notification cancels its still-pending job.
delete from public.scheduled_notifications where idempotency_key = 'tap-outbox-1';
select extensions.is(
  (select status from public.outbox_jobs where dedupe_key = 'notif:tap-outbox-1'),
  'cancelled', 'delete trigger cancelled the pending job');

-- 3: enqueue is deduplicated — second call with the same key leaves one row.
select public.enqueue_outbox_job('t', 'tap-dedupe', (select v from state where k='hh')::uuid);
select public.enqueue_outbox_job('t', 'tap-dedupe', (select v from state where k='hh')::uuid);
select extensions.is(
  (select count(*)::int from public.outbox_jobs where dedupe_key = 'tap-dedupe'),
  1, 'dedupe_key is unique across enqueues');

-- 4: a cancelled job is revived by re-enqueueing the same key.
update public.outbox_jobs set status = 'cancelled', completed_at = now()
  where dedupe_key = 'tap-dedupe';
select public.enqueue_outbox_job('t', 'tap-dedupe', (select v from state where k='hh')::uuid);
select extensions.is(
  (select status from public.outbox_jobs where dedupe_key = 'tap-dedupe'),
  'pending', 'cancelled job revives on re-enqueue');

-- 5/6: claim marks processing; a second claim finds nothing claimable.
select count(*) from public.claim_outbox_jobs('tap-worker', 10);
select extensions.is(
  (select status from public.outbox_jobs where dedupe_key = 'tap-dedupe'),
  'processing', 'claim moved job to processing');
select extensions.is(
  (select count(*)::int from public.claim_outbox_jobs('tap-worker-2', 10)),
  0, 'second claim gets nothing (no double-claim)');

-- 7: lease expiry makes a stuck processing job claimable again.
update public.outbox_jobs set claimed_at = now() - interval '10 minutes'
  where dedupe_key = 'tap-dedupe';
select extensions.ok(
  exists (select 1 from public.claim_outbox_jobs('tap-worker-3', 10, 120)
          where dedupe_key = 'tap-dedupe'),
  'expired lease is reclaimed');

-- 8: failure applies backoff and returns the job to pending.
select public.fail_outbox_job(
  (select id from public.outbox_jobs where dedupe_key = 'tap-dedupe'), 'boom');
select extensions.ok(
  (select attempts = 1 and status = 'pending' and next_attempt_at > now()
   from public.outbox_jobs where dedupe_key = 'tap-dedupe'),
  'failed job backs off into the future with attempts=1');

-- 9: reaching max_attempts is terminal.
update public.outbox_jobs
  set attempts = max_attempts - 1, next_attempt_at = now(), status = 'pending'
  where dedupe_key = 'tap-dedupe';
select count(*) from public.claim_outbox_jobs('tap-worker-4', 10);
select public.fail_outbox_job(
  (select id from public.outbox_jobs where dedupe_key = 'tap-dedupe'), 'boom final');
select extensions.is(
  (select status from public.outbox_jobs where dedupe_key = 'tap-dedupe'),
  'failed', 'exhausted retries end in failed');

-- 10: deferral does NOT consume an attempt.
update public.outbox_jobs
  set status = 'pending', attempts = 0, next_attempt_at = now()
  where dedupe_key = 'tap-dedupe';
select count(*) from public.claim_outbox_jobs('tap-worker-5', 10);
select public.defer_outbox_job(
  (select id from public.outbox_jobs where dedupe_key = 'tap-dedupe'), 600);
select extensions.ok(
  (select attempts = 0 and status = 'pending' and next_attempt_at > now()
   from public.outbox_jobs where dedupe_key = 'tap-dedupe'),
  'deferral reschedules without counting an attempt');

-- 11/12: clients cannot see the queue or run its API.
select set_config('request.jwt.claims',
  json_build_object('sub', (select user_id from public.household_members limit 1),
                    'role', 'authenticated')::text, true);
set local role authenticated;
select extensions.throws_ok(
  $$select count(*) from public.outbox_jobs$$, '42501', null,
  'authenticated cannot read outbox_jobs');
select extensions.throws_ok(
  $$select count(*) from public.claim_outbox_jobs('evil', 1)$$, '42501', null,
  'authenticated cannot execute claim_outbox_jobs');

-- 13/14: activity_log hardening — spoofed actor rejected, updates rejected.
select extensions.throws_ok(
  $$insert into public.activity_log (household_id, actor_id, entity_type, action, summary)
    values ((select v from state where k='hh')::uuid,
            '00000000-0000-4000-8000-00000000dead', 'test', 'spoof', 'x')$$,
  '42501', null, 'activity insert with spoofed actor_id is rejected');
select extensions.throws_ok(
  $$update public.activity_log set summary = 'tampered'$$, '42501', null,
  'activity_log is not updatable by clients');
reset role;

select extensions.finish();
rollback;
