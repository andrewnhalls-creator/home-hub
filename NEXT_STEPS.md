# Next Steps — Fresh Session Checklist

## Start Here
1. Read `HANDOFF.md` (full document)
2. Read `CLAUDE.md`
3. Run `git status --short` and `git log --oneline -5`

> **Session discipline:** Work one stage at a time. Stop and ask the user to start a fresh Claude Code session if context is getting large. After every completed stage, update `HANDOFF.md`, `NEXT_STEPS.md`, commit, push, and wait for "continue".

## Current Position
**Milestone 15, Step 8 — Live push test**

Steps 1–7 complete:
- Step 1: In-app notification centre (bell icon, modal, mark-as-read)
- Step 2: `public/sw.js` service worker
- Step 3: `ServiceWorkerRegistration` + `usePushSubscription` hook + subscription server actions
- Step 4: `/ajustes/notificaciones` page — category toggles, push enable/disable, test button
- Step 5: `supabase/functions/send-push/index.ts` — Edge Function deployed (ACTIVE)
- Step 6a: Edge Function deployed (version 1, ACTIVE, `verify_jwt: true`)
- Step 6b: VAPID secrets set (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`)
- Step 7: Supabase Cron — `send-push-cron` active, fires every minute (jobid 1)

## Immediate Next Task

### Step 8 — Live Push Test
- Subscribe on a real device via `/ajustes/notificaciones` (enable push, grant permission)
- Click "Probar notificación"
- Verify push arrives on device
- Check `notification_delivery_attempts` in Supabase for delivery status
- iOS: PWA must be installed to Home Screen (iOS 16.4+ requirement)

## After Milestone 15
Continue in order per BUILD_PLAN.md:
- Milestone 16: Settings expansion (`/ajustes/dispositivos`, `/categorias`, `/privacidad`, password reset)
- Milestone 17: Activity log + trash/archive UI
- Milestone 18: Polish
- Milestone 19: Offline shopping
- Milestone 20: PWA + install prompt
- Milestone 21: Deploy to Vercel — **ASK USER BEFORE DOING ANYTHING**
- Milestone 22: Final review

## VAPID Key Status
- Public key: in `.env.local` as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` ✅
- Private key: NOT committed. User holds it. Set as Edge Function secret `VAPID_PRIVATE_KEY` in step 6.

## Do NOT
- Deploy Edge Function without asking
- Set Supabase secrets without asking
- Configure Supabase Cron without asking
- Re-apply any database migrations (001–013 are done)
- Recreate any existing routes or components
- Commit `.env`, `.env.local`, secrets, `*.rtf`, or service-role keys
- Force-push
- Deploy to Vercel without asking
- Make destructive DB changes without asking
