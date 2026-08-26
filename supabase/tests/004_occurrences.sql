-- RLS/logic test 004: occurrence history (backend slice B2.1)
-- Run via Supabase MCP `execute_sql` — one transaction, ROLLED BACK.
-- Covers: unique occurrence keys (reminders + chores), upsert-on-recomplete,
-- RLS isolation of completion history, and actor integrity on insert.

begin;
select extensions.plan(8);

create temp table state (k text primary key, v text);
grant all on state to public;
insert into state select 'hh', id::text from public.households limit 1;
insert into state select 'u', user_id::text from public.household_members limit 1;

insert into public.reminders (id, household_id, title, due_at, repeat_frequency, anchor_day)
values ('aaaaaaaa-0000-4000-8000-000000000001',
        (select v from state where k='hh')::uuid,
        'TAP recordatorio', '2026-08-26T07:00:00Z', 'mensual', 31);
insert into public.chores (id, household_id, title, frequency, next_due_date, anchor_day)
values ('bbbbbbbb-0000-4000-8000-000000000001',
        (select v from state where k='hh')::uuid,
        'TAP tarea', 'mensual', '2026-08-31', 31);

-- 1/2: duplicate completion of the same reminder occurrence conflicts.
insert into public.reminder_completions (reminder_id, household_id, occurrence_key, due_at, completed_by)
values ('aaaaaaaa-0000-4000-8000-000000000001', (select v from state where k='hh')::uuid,
        '2026-08-26T07:00:00Z', '2026-08-26T07:00:00Z', (select v from state where k='u')::uuid);
select extensions.throws_ok(
  $$insert into public.reminder_completions (reminder_id, household_id, occurrence_key, completed_by)
    values ('aaaaaaaa-0000-4000-8000-000000000001',
            (select v from state where k='hh')::uuid, '2026-08-26T07:00:00Z',
            (select v from state where k='u')::uuid)$$,
  '23505', null, 'duplicate reminder occurrence completion conflicts');
select extensions.is(
  (select count(*)::int from public.reminder_completions
   where reminder_id = 'aaaaaaaa-0000-4000-8000-000000000001'),
  1, 'exactly one completion row per occurrence');

-- 3: a different occurrence key inserts fine (next month's occurrence).
insert into public.reminder_completions (reminder_id, household_id, occurrence_key, completed_by)
values ('aaaaaaaa-0000-4000-8000-000000000001', (select v from state where k='hh')::uuid,
        '2026-09-30T07:00:00Z', (select v from state where k='u')::uuid);
select extensions.is(
  (select count(*)::int from public.reminder_completions
   where reminder_id = 'aaaaaaaa-0000-4000-8000-000000000001'),
  2, 'distinct occurrences accumulate history');

-- 4: chore occurrence key is unique too.
insert into public.chore_completions (chore_id, household_id, occurrence_key, completed_by)
values ('bbbbbbbb-0000-4000-8000-000000000001', (select v from state where k='hh')::uuid,
        '2026-08-31', (select v from state where k='u')::uuid);
select extensions.throws_ok(
  $$insert into public.chore_completions (chore_id, household_id, occurrence_key, completed_by)
    values ('bbbbbbbb-0000-4000-8000-000000000001',
            (select v from state where k='hh')::uuid, '2026-08-31',
            (select v from state where k='u')::uuid)$$,
  '23505', null, 'duplicate chore occurrence completion conflicts');

-- 5/6: an authenticated outsider sees no completion history.
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000000aa","role":"authenticated"}', true);
set local role authenticated;
select extensions.is(
  (select count(*)::int from public.reminder_completions), 0,
  'outsider sees no reminder completions');
select extensions.is(
  (select count(*)::int from public.chore_completions), 0,
  'outsider sees no chore completions');
reset role;

-- 7/8: a member cannot record completions in someone else's name.
do $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', (select v from state where k='u'), 'role', 'authenticated')::text, true);
end $$;
set local role authenticated;
select extensions.throws_ok(
  $$insert into public.reminder_completions (reminder_id, household_id, occurrence_key, completed_by)
    values ('aaaaaaaa-0000-4000-8000-000000000001',
            (select v from state where k='hh')::uuid, 'spoof-key',
            '00000000-0000-4000-8000-0000000000aa')$$,
  '42501', null, 'reminder completion with spoofed actor is rejected');
select extensions.throws_ok(
  $$insert into public.chore_completions (chore_id, household_id, occurrence_key, completed_by)
    values ('bbbbbbbb-0000-4000-8000-000000000001',
            (select v from state where k='hh')::uuid, 'spoof-key',
            '00000000-0000-4000-8000-0000000000aa')$$,
  '42501', null, 'chore completion with spoofed actor is rejected');
reset role;

select extensions.finish();
rollback;
