# Known Issues and Blockers

## Active

### Push notification delivery not live yet (expected)
- **Stage**: Milestone 15 Step 6 (not yet started)
- **Impact**: "Probar notificación" creates an in-app notification event but no device push arrives.
- **Cause**: `supabase/functions/send-push/index.ts` is written but not deployed. Supabase Cron is not configured.
- **Resolution**: Complete Milestone 15 Step 6 — deploy the Edge Function and set VAPID secrets (ASK USER first). Then Step 7 — configure Supabase Cron.

### VAPID secrets not set in Supabase
- **Stage**: Milestone 15 Step 6
- **Impact**: Edge Function will return 500 if invoked before secrets are set.
- **Required secrets**: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- **Resolution**: User to confirm approval, then set via Supabase dashboard or MCP tool.

### PWA icons (PNG) not yet created
- **Stage**: Milestone 20 (PWA + install prompt)
- **Impact**: Push notification `icon` in `public/sw.js` falls back to `/favicon.ico` (ICO format). Some Android browsers may not display it correctly.
- **Resolution**: Add PNG icons (at least 192×192) to `public/icons/` and update `sw.js` icon path in Milestone 20.

## Resolved

_(none yet)_
