-- Home Hub: lock down set_updated_at
-- Trivial trigger function (sets updated_at = now()), invoked as part of
-- every authenticated update, so authenticated still needs EXECUTE;
-- anon/public access serves no purpose.

revoke execute on function public.set_updated_at() from public, anon;
