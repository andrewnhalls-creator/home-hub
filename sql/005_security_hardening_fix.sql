-- Home Hub: fix 004_security_hardening
-- Supabase grants EXECUTE on new public-schema functions to anon,
-- authenticated, and service_role directly (not only via the PUBLIC
-- pseudo-role), so "revoke ... from public" in 004 did not actually
-- remove anon/authenticated access. Revoke from each role explicitly,
-- then re-grant only what's intentional.

revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to supabase_auth_admin;

revoke execute on function public.handle_new_household() from public, anon, authenticated;

revoke execute on function public.seed_default_categories(uuid) from public, anon, authenticated;

revoke execute on function public.is_household_member(uuid) from public, anon;
grant execute on function public.is_household_member(uuid) to authenticated;

revoke execute on function public.is_household_owner(uuid) from public, anon;
grant execute on function public.is_household_owner(uuid) to authenticated;

revoke execute on function public.create_household(text) from public, anon;
grant execute on function public.create_household(text) to authenticated;

revoke execute on function public.redeem_household_invite(text) from public, anon;
grant execute on function public.redeem_household_invite(text) to authenticated;
