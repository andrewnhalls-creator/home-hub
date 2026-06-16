# Next Steps — Fresh Session Checklist

## Start Here
1. Read `HANDOFF.md` (full document)
2. Read `CLAUDE.md`
3. Read `BUILD_PLAN.md`
4. Run `git status` and `git log --oneline -5`
5. Confirm branch is `main` at commit `bc9ef99`

## Current Position
**Milestone 15, Step 2 — Service Worker for Push Notifications**

Finance (Milestone 12), Documents/Wishlist (Milestone 14), Core Settings (Milestone 15 step 0), and In-app Notification Centre (Milestone 15 step 1) are ALL complete.

## Immediate Next Tasks (Milestone 15 steps 2–8)

### Step 2 — Service Worker
- Create `public/sw.js` with push event listener and notification click handler
- Register SW in a client component or hook (`useEffect` in root layout or dedicated `ServiceWorkerRegistration` component)

### Step 3 — Push Subscription Storage
- After SW registers, call `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: NEXT_PUBLIC_VAPID_PUBLIC_KEY })`
- Send subscription JSON to a server action that upserts into `push_subscriptions` table

### Step 4 — /ajustes/notificaciones Page
- Toggle per-category notification preferences
- "Probar notificación" button that sends a test push

### Step 5 — VAPID Keys
- Regenerate fresh keys: `npx web-push generate-vapid-keys`
- Add `NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public>` to `.env.local`
- ⚠️ ASK USER before storing VAPID_PRIVATE_KEY as Edge Function secret

### Step 6 — Supabase Edge Function
- Create `supabase/functions/send-push/index.ts`
- Deploy via MCP `deploy_edge_function` — ASK USER first
- Set secrets `VAPID_PRIVATE_KEY` and `VAPID_SUBJECT` — ASK USER

### Step 7 — Supabase Cron
- Configure pg_cron job to call Edge Function for scheduled notifications
- ASK USER before configuring

### Step 8 — Verify Live Push
- Test end-to-end push delivery

## After Milestone 15
Continue in order per BUILD_PLAN.md:
- Milestone 16: Settings expansion (`/ajustes/dispositivos`, `/categorias`, `/privacidad`, password reset)
- Milestone 17: Activity log + trash/archive UI
- Milestone 18: Polish
- Milestone 19: Offline shopping
- Milestone 20: PWA + install prompt
- Milestone 21: Deploy to Vercel — **ASK USER BEFORE DOING ANYTHING**
- Milestone 22: Final review

## Do NOT
- Re-apply any database migrations (001–013 are done)
- Recreate any existing routes or components
- Start Milestone 16+ before finishing Milestone 15
- Commit `.env`, `.env.local`, secrets, or service-role keys
- Force-push
- Deploy to Vercel without asking
- Create cloud resources without asking
- Make destructive DB changes without asking
