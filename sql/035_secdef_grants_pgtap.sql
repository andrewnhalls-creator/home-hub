-- 035: SECURITY DEFINER grants + pgTAP (backend slice B1.1, part c)
-- APPLIED 2026-08-26 as remote migration `035_secdef_grants_pgtap`.
-- Fixes advisors 0028/0029. Intentional exceptions that will STILL be flagged
-- for `authenticated` (documented, correct): switch_household /
-- create_household / redeem_household_invite are user-facing RPCs;
-- is_household_member / is_household_owner are RLS policy helpers evaluated
-- as the querying role.

-- Trigger-only functions: triggers run as table owner; no client role needs EXECUTE.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_new_household() from public, anon, authenticated;
revoke execute on function public.seed_default_categories(uuid) from public, anon, authenticated;

-- Cron-only scan (pg_cron job 2 runs it as postgres).
revoke execute on function public.scan_document_expiry_notifications() from public, anon, authenticated;

-- User-facing RPCs and RLS helpers: authenticated only, never anon.
revoke execute on function public.switch_household(uuid) from public, anon;
revoke execute on function public.create_household(text) from public, anon;
revoke execute on function public.redeem_household_invite(text) from public, anon;
revoke execute on function public.is_household_member(uuid) from public, anon;
revoke execute on function public.is_household_owner(uuid) from public, anon;

-- New trigger function from migration 034: same lockdown as set_updated_at.
revoke execute on function public.set_updated_meta() from public, anon;

-- pgTAP for the RLS/database test harness (tests in supabase/tests/ run inside
-- rolled-back transactions).
create extension if not exists pgtap with schema extensions;
