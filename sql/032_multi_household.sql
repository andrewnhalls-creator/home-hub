-- 032_multi_household.sql
-- Adds multi-household support: a user can belong to up to 4 households
-- (as owner or member) and can switch between them via active_household_id.

-- ---------------------------------------------------------------------------
-- 1. Add active_household_id to profiles
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists active_household_id uuid
    references public.households(id) on delete set null;

-- ---------------------------------------------------------------------------
-- 2. Back-fill: set active_household_id for users who already have a household
-- ---------------------------------------------------------------------------
update public.profiles p
set active_household_id = (
  select household_id
  from public.household_members
  where user_id = p.id
  order by created_at asc
  limit 1
)
where p.active_household_id is null;

-- ---------------------------------------------------------------------------
-- 3. Replace create_household to enforce the 4-household limit and
--    set active_household_id on the creator's profile.
-- ---------------------------------------------------------------------------
create or replace function public.create_household(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
  v_display_name text;
  v_count int;
begin
  -- Enforce: a user may belong to at most 4 households total
  select count(*) into v_count
  from public.household_members
  where user_id = auth.uid();

  if v_count >= 4 then
    raise exception 'Un usuario no puede pertenecer a más de 4 hogares';
  end if;

  insert into public.households (name, created_by)
  values (p_name, auth.uid())
  returning id into v_household_id;

  select display_name into v_display_name from public.profiles where id = auth.uid();

  insert into public.household_members (household_id, user_id, role, display_name)
  values (v_household_id, auth.uid(), 'owner', v_display_name);

  -- Set as the active household
  update public.profiles
  set active_household_id = v_household_id
  where id = auth.uid();

  return v_household_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Replace redeem_household_invite to also enforce the limit and
--    set active_household_id on the joining user's profile.
-- ---------------------------------------------------------------------------
create or replace function public.redeem_household_invite(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite record;
  v_display_name text;
  v_count int;
begin
  select * into v_invite
  from public.household_invites
  where code = p_code
    and used_by is null
    and expires_at > now();

  if v_invite is null then
    raise exception 'Código de invitación no válido o caducado';
  end if;

  -- Enforce: a user may belong to at most 4 households total
  select count(*) into v_count
  from public.household_members
  where user_id = auth.uid();

  if v_count >= 4 then
    raise exception 'Ya perteneces al máximo de 4 hogares permitidos';
  end if;

  -- Check household hasn't hit member cap
  select count(*) into v_count
  from public.household_members
  where household_id = v_invite.household_id;

  if v_count >= 5 then
    raise exception 'Este hogar ya tiene el máximo de miembros';
  end if;

  select display_name into v_display_name from public.profiles where id = auth.uid();

  insert into public.household_members (household_id, user_id, role, display_name)
  values (v_invite.household_id, auth.uid(), 'member', v_display_name)
  on conflict (household_id, user_id) do nothing;

  update public.household_invites
  set used_by = auth.uid(), used_at = now()
  where id = v_invite.id;

  -- Switch active household to the one just joined
  update public.profiles
  set active_household_id = v_invite.household_id
  where id = auth.uid();

  return v_invite.household_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. New RPC: switch_household
--    Validates the user is a member of the target household, then sets it
--    as their active household.
-- ---------------------------------------------------------------------------
create or replace function public.switch_household(p_household_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.household_members
    where household_id = p_household_id and user_id = auth.uid()
  ) then
    raise exception 'No perteneces a este hogar';
  end if;

  update public.profiles
  set active_household_id = p_household_id
  where id = auth.uid();
end;
$$;

grant execute on function public.switch_household(uuid) to authenticated;
