-- Home Hub: security hardening
-- Addresses Supabase advisor warnings from 001-003:
--  1. Pin search_path on set_updated_at (mutable search_path warning).
--  2. Tighten EXECUTE grants on security-definer functions to the
--     minimum needed: internal trigger functions (handle_new_user,
--     handle_new_household, seed_default_categories) are not meant to be
--     called directly via the REST RPC surface at all; RLS helper
--     functions (is_household_member/is_household_owner) and the
--     join/create RPCs only need to be callable by signed-in
--     (authenticated) users, never by anon.

alter function public.set_updated_at() set search_path = public;

revoke execute on function public.handle_new_user() from public;
grant execute on function public.handle_new_user() to supabase_auth_admin;

revoke execute on function public.handle_new_household() from public;
revoke execute on function public.seed_default_categories(uuid) from public;

revoke execute on function public.is_household_member(uuid) from public;
grant execute on function public.is_household_member(uuid) to authenticated;

revoke execute on function public.is_household_owner(uuid) from public;
grant execute on function public.is_household_owner(uuid) to authenticated;

revoke execute on function public.create_household(text) from public;
grant execute on function public.create_household(text) to authenticated;

revoke execute on function public.redeem_household_invite(text) from public;
grant execute on function public.redeem_household_invite(text) to authenticated;
