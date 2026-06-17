# Known Issues and Blockers

## Active

### Push notification delivery not yet verified end-to-end
- **Stage**: Milestone 15 Step 8
- **Impact**: Infrastructure is fully wired (Edge Function deployed, VAPID secrets set, Cron active) but delivery has not been confirmed on a real device yet.
- **Resolution**: Manual test — subscribe at `/ajustes/notificaciones`, click "Probar notificación", verify push arrives. Check `notification_delivery_attempts` in Supabase.

### PWA icons (PNG) not yet created
- **Stage**: Milestone 20 (PWA + install prompt)
- **Impact**: Push notification `icon` in `public/sw.js` falls back to `/favicon.ico` (ICO format). Some Android browsers may not display it correctly.
- **Resolution**: Add PNG icons (at least 192×192) to `public/icons/` and update `sw.js` icon path in Milestone 20.

## Resolved

### VAPID secrets not set in Supabase ✅
- Resolved 2026-06-17: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` set as Edge Function secrets in Supabase dashboard.

### Supabase Cron not configured ✅
- Resolved 2026-06-17: `pg_net` + `pg_cron` enabled (migration 014). `send-push-cron` job active (jobid 1, `* * * * *`).
