-- 039: Occurrence history + month-end anchors (backend slice B2.1)
-- APPLIED 2026-08-26 as remote migration 039_occurrence_history.
-- The recurrence engine itself lives in lib/recurrence.ts (single documented
-- engine: diaria/semanal/quincenal/mensual/anual, month-end anchor rule,
-- Europe/Madrid wall-clock preservation across DST). Occurrence keys make
-- completion idempotent and concurrency-safe: the unique constraint is the
-- mutex, and template advancement is guarded (update ... where due unchanged),
-- so a concurrent duplicate completion can never double-advance a series.

alter table public.chores
  add column if not exists anchor_day integer
    check (anchor_day between 1 and 31);
alter table public.reminders
  add column if not exists anchor_day integer
    check (anchor_day between 1 and 31);

update public.chores
  set anchor_day = extract(day from next_due_date)::int
  where anchor_day is null and next_due_date is not null and frequency in ('mensual');
update public.reminders
  set anchor_day = extract(day from (due_at at time zone 'Europe/Madrid'))::int
  where anchor_day is null and due_at is not null and repeat_frequency in ('mensual', 'anual');

create table if not exists public.reminder_completions (
  id uuid primary key default gen_random_uuid(),
  reminder_id uuid not null references public.reminders(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  occurrence_key text not null,
  due_at timestamptz,
  completed_at timestamptz not null default now(),
  completed_by uuid references auth.users(id),
  unique (reminder_id, occurrence_key)
);
create index if not exists idx_reminder_completions_reminder
  on public.reminder_completions (reminder_id, completed_at desc);
create index if not exists idx_reminder_completions_household_id
  on public.reminder_completions (household_id);
create index if not exists idx_reminder_completions_completed_by
  on public.reminder_completions (completed_by);

alter table public.reminder_completions enable row level security;
create policy "reminder_completions_select" on public.reminder_completions
  for select using (public.is_household_member(household_id));
create policy "reminder_completions_insert" on public.reminder_completions
  for insert with check (
    public.is_household_member(household_id)
    and completed_by = (select auth.uid())
  );
-- Re-completing the same occurrence upserts actor/time (documented behaviour).
create policy "reminder_completions_update" on public.reminder_completions
  for update using (public.is_household_member(household_id))
  with check (
    public.is_household_member(household_id)
    and completed_by = (select auth.uid())
  );

alter table public.chore_completions
  add column if not exists occurrence_key text;
update public.chore_completions
  set occurrence_key = 'legacy:' || id::text
  where occurrence_key is null;
alter table public.chore_completions alter column occurrence_key set not null;
create unique index if not exists idx_chore_completions_occurrence
  on public.chore_completions (chore_id, occurrence_key);

create policy "chore_completions_update" on public.chore_completions
  for update using (public.is_household_member(household_id))
  with check (
    public.is_household_member(household_id)
    and completed_by = (select auth.uid())
  );

-- 039b (applied separately): completion history must carry the real actor.
drop policy if exists "chore_completions_insert" on public.chore_completions;
create policy "chore_completions_insert" on public.chore_completions
  for insert with check (
    public.is_household_member(household_id)
    and completed_by = (select auth.uid())
  );
