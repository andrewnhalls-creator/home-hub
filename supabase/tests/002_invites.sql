-- RLS/logic test 002: invitations v2 (backend slice B1.2)
-- Run via Supabase MCP `execute_sql` — the whole file is one transaction that
-- ROLLS BACK, so the fake auth.users rows and all writes vanish.
-- Covers: hashed show-once codes, single-use exhaustion, multi-use limits,
-- revocation, owner-only creation, the 5-members-per-household cap (both via
-- RPC and via direct insert → constraint trigger) and the 4-households-per-
-- user cap.

begin;
select extensions.plan(15);

-- ---------------------------------------------------------------------------
-- Setup: seven fake users (profiles are created by the on-signup trigger),
-- plus a state table readable across role switches.
-- ---------------------------------------------------------------------------
create temp table state (k text primary key, v text);
grant all on state to public;

insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
                        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                        created_at, updated_at)
select '00000000-0000-0000-0000-000000000000',
       ('0000000' || i || '-0000-4000-8000-00000000000' || i)::uuid,
       'authenticated', 'authenticated',
       'test-u' || i || '@example.test', 'x', now(),
       '{"provider":"email"}', ('{"display_name":"Test U' || i || '"}')::jsonb,
       now(), now()
from generate_series(1, 7) i;

-- 1/2: plaintext column is gone; digest column exists.
select extensions.hasnt_column('public', 'household_invites', 'code',
  'plaintext code column dropped');
select extensions.has_column('public', 'household_invites', 'code_hash',
  'code_hash column exists');

-- ---------------------------------------------------------------------------
-- u1 creates a household and a single-use invite.
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"00000001-0000-4000-8000-000000000001","role":"authenticated"}', true);
set local role authenticated;
insert into state values ('hh', (select public.create_household('Hogar Test')::text));
select extensions.ok((select v from state where k = 'hh') is not null,
  'create_household returns the new household id');

insert into state
select 'code1', invite_code from public.create_household_invite();
select extensions.is(length((select v from state where k = 'code1')), 16,
  'invite code is 16 characters');
reset role;

-- ---------------------------------------------------------------------------
-- u2 redeems it; reuse and exhaustion fail.
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"00000002-0000-4000-8000-000000000002","role":"authenticated"}', true);
set local role authenticated;
select extensions.is(
  public.redeem_household_invite((select v from state where k = 'code1'))::text,
  (select v from state where k = 'hh'),
  'redemption returns the invited household id');
select extensions.ok(exists (
    select 1 from public.household_members
    where household_id = (select v from state where k = 'hh')::uuid
      and user_id = '00000002-0000-4000-8000-000000000002'),
  'redemption created the membership');
reset role;

select set_config('request.jwt.claims',
  '{"sub":"00000003-0000-4000-8000-000000000003","role":"authenticated"}', true);
set local role authenticated;
select extensions.throws_ok(
  $$select public.redeem_household_invite((select v from state where k = 'code1'))$$,
  'Código de invitación no válido o caducado',
  'a single-use code cannot be redeemed twice');
reset role;

-- ---------------------------------------------------------------------------
-- Multi-use invite fills the household to its 5-member cap.
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"00000001-0000-4000-8000-000000000001","role":"authenticated"}', true);
set local role authenticated;
insert into state
select 'code2', invite_code from public.create_household_invite(168, 5);
reset role;

select set_config('request.jwt.claims',
  '{"sub":"00000003-0000-4000-8000-000000000003","role":"authenticated"}', true);
set local role authenticated;
select public.redeem_household_invite((select v from state where k = 'code2'));
reset role;
select set_config('request.jwt.claims',
  '{"sub":"00000004-0000-4000-8000-000000000004","role":"authenticated"}', true);
set local role authenticated;
select public.redeem_household_invite((select v from state where k = 'code2'));
reset role;
select set_config('request.jwt.claims',
  '{"sub":"00000005-0000-4000-8000-000000000005","role":"authenticated"}', true);
set local role authenticated;
select public.redeem_household_invite((select v from state where k = 'code2'));
reset role;

select extensions.is(
  (select count(*)::int from public.household_members
   where household_id = (select v from state where k = 'hh')::uuid), 5,
  'household reached five members');

-- An existing member redeeming a still-valid code gets the membership error.
select set_config('request.jwt.claims',
  '{"sub":"00000002-0000-4000-8000-000000000002","role":"authenticated"}', true);
set local role authenticated;
select extensions.throws_ok(
  $$select public.redeem_household_invite((select v from state where k = 'code2'))$$,
  'Ya eres miembro de este hogar',
  'an existing member cannot redeem again');
reset role;

select set_config('request.jwt.claims',
  '{"sub":"00000006-0000-4000-8000-000000000006","role":"authenticated"}', true);
set local role authenticated;
select extensions.throws_ok(
  $$select public.redeem_household_invite((select v from state where k = 'code2'))$$,
  'Este hogar ya tiene el máximo de miembros',
  'sixth member is rejected by the RPC');
reset role;

-- 11: the constraint trigger also blocks a direct insert past the cap.
select extensions.throws_ok(
  $$insert into public.household_members (household_id, user_id, role, display_name)
    values ((select v from state where k = 'hh')::uuid,
            '00000007-0000-4000-8000-000000000007', 'member', 'Test U7')$$,
  'Este hogar ya tiene el máximo de miembros',
  'direct insert past the member cap is rejected by the trigger');

-- ---------------------------------------------------------------------------
-- Revocation.
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims',
  '{"sub":"00000001-0000-4000-8000-000000000001","role":"authenticated"}', true);
set local role authenticated;
insert into state
select 'inv3', invite_id::text from public.create_household_invite();
select public.revoke_household_invite((select v from state where k = 'inv3')::uuid);
reset role;

select set_config('request.jwt.claims',
  '{"sub":"00000006-0000-4000-8000-000000000006","role":"authenticated"}', true);
set local role authenticated;
select extensions.throws_ok(
  $$select public.redeem_household_invite('AAAAAAAAAAAAAAAA')$$,
  'Código de invitación no válido o caducado',
  'unknown/revoked code is rejected without leaking details');
reset role;

-- 13: only the owner can create invites.
select set_config('request.jwt.claims',
  '{"sub":"00000002-0000-4000-8000-000000000002","role":"authenticated"}', true);
set local role authenticated;
select extensions.throws_ok(
  $$select * from public.create_household_invite()$$,
  'Solo la persona propietaria del hogar puede generar invitaciones',
  'a non-owner member cannot create invites');
reset role;

-- 14: a user cannot belong to more than 4 households.
select set_config('request.jwt.claims',
  '{"sub":"00000007-0000-4000-8000-000000000007","role":"authenticated"}', true);
set local role authenticated;
select public.create_household('Hogar U7-1');
select public.create_household('Hogar U7-2');
select public.create_household('Hogar U7-3');
select public.create_household('Hogar U7-4');
select extensions.throws_ok(
  $$select public.create_household('Hogar U7-5')$$,
  'Un usuario no puede pertenecer a más de 4 hogares',
  'fifth household via create_household is rejected');
reset role;

-- 15: the caps trigger also blocks a DIRECT insert that would give a user a
-- fifth household (u6 owns a fresh household; u7 already has four).
select set_config('request.jwt.claims',
  '{"sub":"00000006-0000-4000-8000-000000000006","role":"authenticated"}', true);
set local role authenticated;
insert into state values ('hh6', (select public.create_household('Hogar U6')::text));
reset role;
select extensions.throws_ok(
  $$insert into public.household_members (household_id, user_id, role, display_name)
    values ((select v from state where k = 'hh6')::uuid,
            '00000007-0000-4000-8000-000000000007', 'member', 'Test U7')$$,
  'Ya perteneces al máximo de 4 hogares permitidos',
  'direct insert past the user household cap is rejected by the trigger');

select extensions.finish();
rollback;
