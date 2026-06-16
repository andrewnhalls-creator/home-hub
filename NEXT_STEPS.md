# Next Steps — Fresh Session Checklist

## Start Here
1. Read `HANDOFF.md` (full document)
2. Read `CLAUDE.md`
3. Read `BUILD_PLAN.md`
4. Run `git status` and `git log --oneline -5`

## Current Position
**Milestone 15, Step 5 — Supabase Edge Function for Push Delivery**

Steps 1–4 are complete:
- Step 1: In-app notification centre (bell icon, modal, mark-as-read)
- Step 2: `public/sw.js` service worker
- Step 3: `ServiceWorkerRegistration` component + `usePushSubscription` hook + server actions (upsertPushSubscription, removePushSubscription, upsertNotificationPreferences, sendTestNotification)
- Step 4: `/ajustes/notificaciones` page — category toggles, push enable/disable, test button

## Immediate Next Tasks (Milestone 15 steps 5–8)

### Step 5 — Supabase Edge Function
- Create `supabase/functions/send-push/index.ts`
- Uses `web-push` (or the VAPID JWT approach in Deno) to send push notifications
- Reads `push_subscriptions` for active subscriptions, sends via VAPID
- ⚠️ **ASK USER before deploying** via `mcp__supabase__deploy_edge_function`
- ⚠️ **ASK USER before setting secrets** `VAPID_PRIVATE_KEY` and `VAPID_SUBJECT`

### Step 6 — Supabase Cron
- Configure `pg_cron` job to invoke the Edge Function for scheduled notifications
- ⚠️ **ASK USER before configuring**

### Step 7 — Live Push Test
- End-to-end: subscribe on device → trigger notification → verify delivery

## After Milestone 15
Continue in order per BUILD_PLAN.md:
- Milestone 16: Settings expansion (`/ajustes/dispositivos`, `/categorias`, `/privacidad`, password reset)
- Milestone 17: Activity log + trash/archive UI
- Milestone 18: Polish
- Milestone 19: Offline shopping
- Milestone 20: PWA + install prompt
- Milestone 21: Deploy to Vercel — **ASK USER BEFORE DOING ANYTHING**
- Milestone 22: Final review

## VAPID Keys (generated this session)
- Public key in `.env.local` as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` ✅
- Private key: NOT committed. Store as Supabase Edge Function secret `VAPID_PRIVATE_KEY` when deploying `send-push`.
- Subject: `mailto:andrew.halls@hotmail.es` → set as `VAPID_SUBJECT` Edge Function secret.

## Do NOT
- Re-apply any database migrations (001–013 are done)
- Recreate any existing routes or components
- Commit `.env`, `.env.local`, secrets, or service-role keys
- Force-push
- Deploy to Vercel without asking
- Create cloud resources without asking
- Make destructive DB changes without asking
- Set Edge Function secrets without asking
