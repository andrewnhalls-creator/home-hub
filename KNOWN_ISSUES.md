# Known Issues and Blockers

## Active

### Push notification end-to-end device test deferred
- **Stage**: Milestone 22 (final review)
- **Impact**: Infrastructure confirmed healthy (cron → Edge Function returns HTTP 200). Actual device delivery test requires real user accounts, which don't exist yet.
- **Resolution**: Test at Milestone 22 — create real accounts, subscribe at `/ajustes/notificaciones`, verify push arrives end-to-end.

### PWA icons (PNG) not yet created
- **Stage**: Milestone 20 (PWA + install prompt)
- **Impact**: Push notification `icon` in `public/sw.js` falls back to `/favicon.ico` (ICO format). Some Android browsers may not display it correctly.
- **Resolution**: Add PNG icons (at least 192×192) to `public/icons/` and update `sw.js` icon path in Milestone 20.

## Resolved

### Edge Function returning HTTP 500 on every cron invocation ✅
- Resolved 2026-06-17: Two root causes fixed: (1) `npm:web-push` replaced with `https://esm.sh/web-push@3.6.7` for Deno runtime compatibility; (2) `VAPID_PUBLIC_KEY` Edge Function secret was stored with wrong encoding — corrected in Supabase dashboard. Cron now returns HTTP 200 consistently.

### VAPID secrets not set in Supabase ✅
- Resolved 2026-06-17: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` set and verified working.

### Supabase Cron not configured ✅
- Resolved 2026-06-17: `pg_net` + `pg_cron` enabled (migration 014). `send-push-cron` job active (jobid 1, `* * * * *`).
