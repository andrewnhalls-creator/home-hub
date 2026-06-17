-- Migration 014: Enable pg_net and pg_cron for scheduled push notification delivery
-- Applied via Supabase MCP on 2026-06-17

CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Cron job registered separately via cron.schedule() (see HANDOFF.md Step 7)
-- Job: send-push-cron, schedule: * * * * *, jobid: 1
