-- RLS test 001: household isolation (backend slice B1.1)
--
-- How to run (no local Supabase stack in this project): execute this file's
-- content against the live project via the Supabase MCP `execute_sql` tool.
-- Everything runs inside a transaction that is ROLLED BACK — no data changes.
-- Requires pgTAP (migration 035). Until pgTAP is applied, the equivalent
-- plain-SQL checks below were run manually on 2026-08-26 (both passed):
--   outsider (unknown authenticated uuid) → 0 rows visible in households,
--   shopping_items, expenses, household_members, push_subscriptions,
--   activity_log; real member → sees exactly their household's rows.

begin;
select extensions.plan(7);

-- 1) An authenticated user who belongs to NO household sees nothing.
select set_config('request.jwt.claims',
  json_build_object('sub', '00000000-0000-4000-8000-000000000001',
                    'role', 'authenticated')::text, true);
set local role authenticated;

select extensions.is((select count(*) from public.households)::int, 0,
  'outsider sees no households');
select extensions.is((select count(*) from public.household_members)::int, 0,
  'outsider sees no memberships');
select extensions.is((select count(*) from public.expenses)::int, 0,
  'outsider sees no expenses');
select extensions.is((select count(*) from public.push_subscriptions)::int, 0,
  'outsider sees no push subscriptions');
select extensions.is((select count(*) from public.activity_log)::int, 0,
  'outsider sees no activity');

-- 2) A real member sees their household.
reset role;
do $$
declare v_uid uuid;
begin
  select user_id into v_uid from public.household_members limit 1;
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_uid, 'role', 'authenticated')::text, true);
end $$;
set local role authenticated;

select extensions.ok((select count(*) from public.households) >= 1,
  'member sees their household');
select extensions.ok((select count(*) from public.household_members) >= 1,
  'member sees household memberships');

select extensions.finish();
rollback;
