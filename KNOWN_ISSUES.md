# Known Issues and Blockers

## Active

### Leaked-password protection disabled (advisor WARN) — ACCEPTED RISK
- **Decision 2026-08-26 (user)**: the feature is Pro-plan-only on Supabase and the app
  is used by exactly two known household members, so the WARN is accepted and no
  upgrade will be made for it. Revisit only if the project ever moves to Pro anyway.

### Advisor WARNs kept intentionally (documented exceptions)
- `authenticated` can execute SECURITY DEFINER fns `create_household`,
  `redeem_household_invite`, `switch_household` (user-facing RPCs) and
  `is_household_member` / `is_household_owner` (RLS policy helpers) — by design;
  `anon` is fully revoked (migration 035).
- 5 "unused index" INFO lints kept: real query-support indexes; zero scans only
  because the DB is nearly empty.

### GitHub repo is public (intentional, Hobby plan)
- **Decision 2026-06-19**: Staying on Vercel Hobby. Public repo is required for GitHub-triggered auto-deploys on Hobby.
- **Risk**: Code is publicly readable. Acceptable — no secrets are committed (`.env.local` gitignored; service-role key and VAPID private key are only in Supabase/Vercel dashboards, never in the repo).
- **Revisit**: If sensitive logic is ever added, upgrade to Vercel Pro (~$20/month) to enable private-repo deploys.

## Resolved

### pg_net moved out of `public` schema ✅
- **Resolved 2026-08-26** (migration `036_relocate_pg_net`, user-approved): drop+recreate
  into `extensions`. Verified `net.http_post` exists and the push cron kept succeeding.

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
