-- Home Hub: RLS performance tuning
-- Addresses two real WARN-level advisor findings (the rest are INFO-level
-- noise expected on an empty database — unused indexes, FK columns that
-- are rarely filtered on like created_by/paid_by):
--  1. auth_rls_initplan: wrap auth.uid() as (select auth.uid()) so Postgres
--     caches it once per query instead of re-evaluating per row.
--  2. multiple_permissive_policies: profiles had two separate permissive
--     SELECT policies (own profile, household members' profiles) that
--     both had to run per row; merged into one.

drop policy "profiles_select_own" on public.profiles;
drop policy "profiles_select_household_members" on public.profiles;

create policy "profiles_select" on public.profiles
  for select using (
    id = (select auth.uid())
    or exists (
      select 1
      from public.household_members me
      join public.household_members them on them.household_id = me.household_id
      where me.user_id = (select auth.uid()) and them.user_id = public.profiles.id
    )
  );

drop policy "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = (select auth.uid()));

drop policy "households_insert_authenticated" on public.households;
create policy "households_insert_authenticated" on public.households
  for insert with check (created_by = (select auth.uid()));
