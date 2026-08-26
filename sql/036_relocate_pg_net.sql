-- 036: move pg_net out of the public schema (advisor 0014)
-- APPLIED 2026-08-26 as remote migration `036_relocate_pg_net` (user-approved).
-- pg_net is not relocatable via ALTER EXTENSION on the installed version
-- (0.20.3 returns 0A000), so drop + recreate. The `net` schema and its API are
-- recreated with the extension, so the pg_cron push job calling
-- net.http_post(...) keeps working (verified: runs succeeded after applying);
-- the only loss was the transient async request/response queue.
drop extension pg_net;
create extension pg_net with schema extensions;
