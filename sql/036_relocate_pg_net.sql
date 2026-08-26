-- 036: move pg_net out of the public schema (advisor 0014)
-- STATUS: NOT APPLIED — needs an explicit user decision. pg_net is not
-- relocatable via ALTER EXTENSION on the installed version (0.20.3 returns
-- 0A000), so the only path is drop + recreate, which momentarily touches the
-- push-notification cron dependency (net.http_post). The `net` schema and its
-- API are recreated with the extension, so pg_cron job 1 keeps working; the
-- only loss is the transient async request/response queue.
-- Run via MCP apply_migration after approval, ideally right after a cron tick.
drop extension pg_net;
create extension pg_net with schema extensions;
