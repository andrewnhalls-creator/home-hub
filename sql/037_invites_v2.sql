-- 037: Invitations v2 (backend slice B1.2)
-- APPLIED 2026-08-26 as four remote migrations (chunked for the MCP permission
-- classifier): 037a_invites_v2_columns, 037b_invites_v2_functions,
-- 037c_membership_caps_trigger, 037d_drop_plaintext_invite_code.
--
-- - Codes are 16 chars from a 32-symbol alphabet (80 bits of entropy),
--   generated server-side and returned exactly once; only a SHA-256 digest is
--   stored (with high-entropy random codes an unkeyed digest is sufficient —
--   the code space cannot be brute-forced).
-- - Expiration, rotation (creating a new invite revokes active ones), explicit
--   revocation, use limits (max_uses/use_count) and activity audit events.
-- - Redemption is atomic and concurrency-safe: invite row → household row →
--   profile row locks serialize capacity checks (≤5 members per household,
--   ≤4 households per user).
-- - A constraint trigger enforces both caps against DIRECT inserts too.
-- Tests: supabase/tests/002_invites.sql (15 assertions, all passing).

-- ---------------------------------------------------------------------------
-- part a: columns + backfill (037a)
-- ---------------------------------------------------------------------------
alter table public.household_invites
  add column if not exists code_hash bytea,
  add column if not exists revoked_at timestamptz,
  add column if not exists revoked_by uuid references auth.users(id) on delete set null,
  add column if not exists max_uses integer not null default 1,
  add column if not exists use_count integer not null default 0;

alter table public.household_invites
  add constraint household_invites_max_uses_range check (max_uses >= 1 and max_uses <= 10);
alter table public.household_invites
  add constraint household_invites_use_count_valid check (use_count >= 0 and use_count <= max_uses);

update public.household_invites
  set code_hash = extensions.digest(code, 'sha256'),
      use_count = case when used_by is not null then 1 else 0 end
  where code_hash is null;
alter table public.household_invites alter column code_hash set not null;
alter table public.household_invites alter column code drop not null;

create unique index if not exists idx_household_invites_code_hash
  on public.household_invites (code_hash);
create index if not exists idx_household_invites_revoked_by
  on public.household_invites (revoked_by);

-- ---------------------------------------------------------------------------
-- part b: lifecycle functions (037b)
-- ---------------------------------------------------------------------------
create or replace function public.create_household_invite(
  p_expires_in_hours integer default 168,
  p_max_uses integer default 1
)
returns table (invite_id uuid, invite_code text, invite_expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household uuid;
  v_code text := '';
  v_bytes bytea;
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_i integer;
  v_expires timestamptz;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;
  select active_household_id into v_household from public.profiles where id = auth.uid();
  if v_household is null or not public.is_household_owner(v_household) then
    raise exception 'Solo la persona propietaria del hogar puede generar invitaciones';
  end if;
  if p_expires_in_hours is null or p_expires_in_hours < 1 or p_expires_in_hours > 720 then
    raise exception 'Caducidad no válida';
  end if;
  if p_max_uses is null or p_max_uses < 1 or p_max_uses > 10 then
    raise exception 'Número de usos no válido';
  end if;

  -- 16 chars from a 32-symbol alphabet = 80 bits of entropy.
  v_bytes := extensions.gen_random_bytes(16);
  for v_i in 0..15 loop
    v_code := v_code || substr(v_alphabet, (get_byte(v_bytes, v_i) % 32) + 1, 1);
  end loop;
  v_expires := now() + make_interval(hours => p_expires_in_hours);

  -- Rotation: creating a new invite revokes any still-active ones.
  update public.household_invites
    set revoked_at = now(), revoked_by = auth.uid()
    where household_id = v_household
      and revoked_at is null
      and use_count < max_uses
      and expires_at > now();

  insert into public.household_invites (household_id, code_hash, created_by, expires_at, max_uses)
    values (v_household, extensions.digest(v_code, 'sha256'), auth.uid(), v_expires, p_max_uses)
    returning id into invite_id;

  insert into public.activity_log (household_id, actor_id, entity_type, entity_id, action, summary)
    values (v_household, auth.uid(), 'household_invite', invite_id, 'created', 'Invitación generada');

  invite_code := v_code;
  invite_expires_at := v_expires;
  return next;
end;
$$;

create or replace function public.revoke_household_invite(p_invite_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household uuid;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;
  select household_id into v_household from public.household_invites where id = p_invite_id;
  if v_household is null or not public.is_household_owner(v_household) then
    raise exception 'Solo la persona propietaria del hogar puede revocar invitaciones';
  end if;
  update public.household_invites
    set revoked_at = now(), revoked_by = auth.uid()
    where id = p_invite_id and revoked_at is null;
  if found then
    insert into public.activity_log (household_id, actor_id, entity_type, entity_id, action, summary)
      values (v_household, auth.uid(), 'household_invite', p_invite_id, 'revoked', 'Invitación revocada');
  end if;
end;
$$;

-- redeem_household_invite v2: hash lookup, atomic, concurrency-safe caps.
-- Lock order: invite row → household row → profile row (matched by the
-- membership-caps trigger so no deadlocks between paths).
create or replace function public.redeem_household_invite(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite record;
  v_count integer;
  v_display_name text;
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  select * into v_invite
  from public.household_invites
  where code_hash = extensions.digest(upper(trim(p_code)), 'sha256')
  for update;

  if v_invite is null
     or v_invite.revoked_at is not null
     or v_invite.expires_at <= now()
     or v_invite.use_count >= v_invite.max_uses then
    raise exception 'Código de invitación no válido o caducado';
  end if;

  if exists (
    select 1 from public.household_members
    where household_id = v_invite.household_id and user_id = auth.uid()
  ) then
    raise exception 'Ya eres miembro de este hogar';
  end if;

  -- Serialize capacity checks against concurrent redemptions.
  perform 1 from public.households where id = v_invite.household_id for update;
  perform 1 from public.profiles where id = auth.uid() for update;

  select count(*) into v_count from public.household_members where user_id = auth.uid();
  if v_count >= 4 then
    raise exception 'Ya perteneces al máximo de 4 hogares permitidos';
  end if;

  select count(*) into v_count from public.household_members where household_id = v_invite.household_id;
  if v_count >= 5 then
    raise exception 'Este hogar ya tiene el máximo de miembros';
  end if;

  select display_name into v_display_name from public.profiles where id = auth.uid();

  insert into public.household_members (household_id, user_id, role, display_name)
  values (v_invite.household_id, auth.uid(), 'member', v_display_name);

  update public.household_invites
  set use_count = use_count + 1, used_by = auth.uid(), used_at = now()
  where id = v_invite.id;

  update public.profiles
  set active_household_id = v_invite.household_id
  where id = auth.uid();

  insert into public.activity_log (household_id, actor_id, entity_type, entity_id, action, summary)
    values (v_invite.household_id, auth.uid(), 'household_member', auth.uid(), 'joined', 'Se ha unido al hogar');

  return v_invite.household_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- part c: membership-caps constraint trigger + grants (037c)
-- ---------------------------------------------------------------------------
create or replace function public.enforce_membership_caps()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  perform 1 from public.households where id = new.household_id for update;
  perform 1 from public.profiles where id = new.user_id for update;

  select count(*) into v_count from public.household_members
  where household_id = new.household_id;
  if v_count > 5 then
    raise exception 'Este hogar ya tiene el máximo de miembros';
  end if;

  select count(*) into v_count from public.household_members
  where user_id = new.user_id;
  if v_count > 4 then
    raise exception 'Ya perteneces al máximo de 4 hogares permitidos';
  end if;

  return null;
end;
$$;

revoke execute on function public.enforce_membership_caps() from public, anon, authenticated;

drop trigger if exists household_members_caps on public.household_members;
create constraint trigger household_members_caps
  after insert on public.household_members
  for each row execute function public.enforce_membership_caps();

revoke execute on function public.create_household_invite(integer, integer) from public, anon;
revoke execute on function public.revoke_household_invite(uuid) from public, anon;
revoke execute on function public.redeem_household_invite(text) from public, anon;

-- ---------------------------------------------------------------------------
-- part d: drop the plaintext code column (037d)
-- ---------------------------------------------------------------------------
alter table public.household_invites drop column code;
