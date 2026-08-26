-- RLS/logic test 006: calendar exceptions + menu-list idempotency (B2.3)
-- Run via Supabase MCP `execute_sql` — one transaction, ROLLED BACK.

begin;
select extensions.plan(6);

create temp table state (k text primary key, v text);
grant all on state to public;
insert into state select 'hh', id::text from public.households limit 1;
insert into state select 'u', user_id::text from public.household_members limit 1;

-- 1: one generated shopping list per menu week.
insert into public.shopping_lists (household_id, name, source_menu_week_start, status, created_by)
values ((select v from state where k='hh')::uuid, 'TAP menú', '2026-08-24', 'activa',
        (select v from state where k='u')::uuid);
select extensions.throws_ok(
  $$insert into public.shopping_lists (household_id, name, source_menu_week_start, status, created_by)
    values ((select v from state where k='hh')::uuid, 'TAP menú bis', '2026-08-24', 'activa',
            (select v from state where k='u')::uuid)$$,
  '23505', null, 'second list for the same menu week conflicts');

-- 2: a deleted list frees the slot.
update public.shopping_lists
  set deleted_at = now(), deleted_by = (select v from state where k='u')::uuid
  where household_id = (select v from state where k='hh')::uuid and name = 'TAP menú';
insert into public.shopping_lists (household_id, name, source_menu_week_start, status, created_by)
values ((select v from state where k='hh')::uuid, 'TAP menú 2', '2026-08-24', 'activa',
        (select v from state where k='u')::uuid);
select extensions.ok(true, 'deleted list frees the menu-week slot');

-- 3/4: calendar exceptions are unique per event+date; end >= start enforced.
insert into public.calendar_events (id, household_id, title, event_date, repeat_frequency)
values ('dddddddd-0000-4000-8000-000000000001',
        (select v from state where k='hh')::uuid, 'TAP evento', '2026-08-03', 'semanal');
insert into public.calendar_event_exceptions (event_id, household_id, occurrence_date, created_by)
values ('dddddddd-0000-4000-8000-000000000001', (select v from state where k='hh')::uuid,
        '2026-08-17', (select v from state where k='u')::uuid);
select extensions.throws_ok(
  $$insert into public.calendar_event_exceptions (event_id, household_id, occurrence_date, created_by)
    values ('dddddddd-0000-4000-8000-000000000001',
            (select v from state where k='hh')::uuid, '2026-08-17',
            (select v from state where k='u')::uuid)$$,
  '23505', null, 'duplicate exception for the same occurrence conflicts');
select extensions.throws_ok(
  $$insert into public.calendar_events (household_id, title, event_date, end_date)
    values ((select v from state where k='hh')::uuid, 'TAP mal', '2026-08-10', '2026-08-09')$$,
  '23514', null, 'end_date before event_date is rejected');

-- 5/6: outsiders see no exceptions and cannot insert them.
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000000aa","role":"authenticated"}', true);
set local role authenticated;
select extensions.is(
  (select count(*)::int from public.calendar_event_exceptions), 0,
  'outsider sees no exceptions');
select extensions.throws_ok(
  $$insert into public.calendar_event_exceptions (event_id, household_id, occurrence_date)
    values ('dddddddd-0000-4000-8000-000000000001',
            (select v from state where k='hh')::uuid, '2026-08-24')$$,
  '42501', null, 'outsider cannot insert exceptions');
reset role;

select extensions.finish();
rollback;
