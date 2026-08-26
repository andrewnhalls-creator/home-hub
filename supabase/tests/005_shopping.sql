-- RLS/logic test 005: shopping idempotency + quick purchase (backend slice B2.2)
-- Run via Supabase MCP `execute_sql` — one transaction, ROLLED BACK.
-- Covers: transactional finish_quick_purchase (expense + item clearing,
-- amount conversion, pending items untouched), input validation, mutation-id
-- dedupe, and RLS isolation of shopping_mutations.
-- The version-based conflict semantics live in the server action
-- (toggleShoppingItemComplete) and are exercised through the app.

begin;
select extensions.plan(7);

create temp table state (k text primary key, v text);
grant all on state to public;
insert into state select 'hh', id::text from public.households limit 1;
insert into state select 'u', user_id::text from public.household_members limit 1;

-- Seed standing-list items: two bought, one pending.
insert into public.shopping_items (household_id, name, is_completed, created_by)
values ((select v from state where k='hh')::uuid, 'TAP leche', true,  (select v from state where k='u')::uuid),
       ((select v from state where k='hh')::uuid, 'TAP pan',   true,  (select v from state where k='u')::uuid),
       ((select v from state where k='hh')::uuid, 'TAP fruta', false, (select v from state where k='u')::uuid);

-- Act as the member.
do $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', (select v from state where k='u'), 'role', 'authenticated')::text, true);
end $$;
set local role authenticated;

insert into state values ('expense', (select public.finish_quick_purchase(4237)::text));

-- 1: expense created with the exact converted amount.
select extensions.is(
  (select amount::text from public.expenses where id = (select v from state where k='expense')::uuid),
  '42.37', 'quick purchase records 4237 cents as 42.37');

-- 2/3: bought standing items cleared, pending item untouched.
select extensions.is(
  (select count(*)::int from public.shopping_items
   where household_id = (select v from state where k='hh')::uuid
     and name like 'TAP %' and is_completed), 0,
  'bought items were cleared');
select extensions.is(
  (select count(*)::int from public.shopping_items
   where household_id = (select v from state where k='hh')::uuid
     and name = 'TAP fruta'), 1,
  'pending item remains');

-- 4: invalid amounts are rejected.
select extensions.throws_ok(
  $$select public.finish_quick_purchase(0)$$,
  'P0001', null, 'zero amount is rejected');

-- 5: mutation ids are single-use (offline replay dedupe).
insert into public.shopping_mutations (id, household_id)
values ('cccccccc-0000-4000-8000-000000000001', (select v from state where k='hh')::uuid);
select extensions.throws_ok(
  $$insert into public.shopping_mutations (id, household_id)
    values ('cccccccc-0000-4000-8000-000000000001',
            (select v from state where k='hh')::uuid)$$,
  '23505', null, 'replayed mutation id conflicts');
reset role;

-- 6/7: an authenticated outsider can neither read nor write mutations.
select set_config('request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-0000000000aa","role":"authenticated"}', true);
set local role authenticated;
select extensions.is(
  (select count(*)::int from public.shopping_mutations), 0,
  'outsider sees no mutations');
select extensions.throws_ok(
  $$insert into public.shopping_mutations (id, household_id)
    values ('cccccccc-0000-4000-8000-000000000002',
            (select v from state where k='hh')::uuid)$$,
  '42501', null, 'outsider cannot insert mutations');
reset role;

select extensions.finish();
rollback;
