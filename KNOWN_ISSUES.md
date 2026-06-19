# Known Issues and Blockers

## Active

### GitHub repo is public (intentional, Hobby plan)
- **Decision 2026-06-19**: Staying on Vercel Hobby. Public repo is required for GitHub-triggered auto-deploys on Hobby.
- **Risk**: Code is publicly readable. Acceptable — no secrets are committed (`.env.local` gitignored; service-role key and VAPID private key are only in Supabase/Vercel dashboards, never in the repo).
- **Revisit**: If sensitive logic is ever added, upgrade to Vercel Pro (~$20/month) to enable private-repo deploys.

## Resolved

### "Más" button crash fixed ✅
- **Resolved 2026-06-18** (`3791097`): `ClockClockwise` icon was missing from `PHOSPHOR_MENU_ICONS` in `MoreMenuSheet.tsx`, causing the sheet to crash on open. Added the `/actividad` entry and its accent.

### Push notification end-to-end device test ✅
- **Resolved 2026-06-18**: Real-device test confirmed — push notifications deliver end-to-end.

### PWA icons (PNG) not yet created ✅
- **Resolved 2026-06-17**: `icon-192.png`, `icon-512.png`, and `apple-touch-icon.png` added to `public/icons/`. `sw.js` icon path updated to `/icons/icon-192.png`.

### Edge Function returning HTTP 500 on every cron invocation ✅
- Resolved 2026-06-17: Two root causes fixed: (1) `npm:web-push` replaced with `https://esm.sh/web-push@3.6.7` for Deno runtime compatibility; (2) `VAPID_PUBLIC_KEY` Edge Function secret was stored with wrong encoding — corrected in Supabase dashboard. Cron now returns HTTP 200 consistently.

### VAPID secrets not set in Supabase ✅
- Resolved 2026-06-17: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` set and verified working.

### Supabase Cron not configured ✅
- Resolved 2026-06-17: `pg_net` + `pg_cron` enabled (migration 014). `send-push-cron` job active (jobid 1, `* * * * *`).
