# Home Hub — Handoff Document
Generated: 2026-06-17 (updated after Step 8 infrastructure health check)

## Project Summary
Private Spanish-Spain household-management PWA for two named users: **Andrew** (owner) and **Jose** (member).
- Local folder: `/Users/dianezhalls/Projects/home-hub`
- GitHub repo: `andrewnhalls-creator/home-hub` (private)
- Supabase project ID: `xzkavpjwvadqldauaabm`

## Tech Stack
- Next.js 16.2.9 App Router + TypeScript
- Tailwind v4 (custom tokens in `app/globals.css`)
- Supabase (auth, RLS, Postgres 17, Edge Functions, Cron)
- Vercel (not yet linked)
- Locale: es-ES, EUR/€, dd/MM/yyyy, 24h, Monday week start

## Current Branch & Commit
- Branch: `main`
- Latest commit: `228162a` — "Fix Edge Function: replace npm:web-push with esm.sh import"
- Git status: **clean**, everything pushed to GitHub

## Phase Status

### Completed Milestones
1. Planning + BUILD_PLAN.md
2. Next.js scaffold + deps + Tailwind + env
3. Supabase schema (migrations 001–013 applied)
4. Auth + household onboarding
5. App shell / nav (Sidebar, TopBar, BottomNav, AppShell)
6. Dashboard (`/dashboard`)
7. Shopping module (`/compra`) — lists, items, pantry
8. Weekly menu + recipes (`/menu`)
9. Reminders (`/recordatorios`) + Chores (`/tareas`)
10. Calendar (`/calendario`) — events, privacy flag
11. Finance (`/finanzas`) — manual payment tracking, payment history
12. Weekly shopping spend tracking (`expenses` table, no double-counting via partial unique index)
13. Documents (`/documentos`) + Wishlist (`/deseos`)
14. **Milestone 15 Core Settings** (`/ajustes`) — household name, members list, invite code, profile display name, sign-out
15. **Milestone 15 Step 1: In-app notification centre** — bell icon, unread badge, modal panel, mark-as-read, grouped by day
16. **Milestone 15 Steps 2–4: Service worker + push subscriptions + /ajustes/notificaciones** — `public/sw.js`, `ServiceWorkerRegistration` component, `usePushSubscription` hook, server actions (upsertPushSubscription, removePushSubscription, upsertNotificationPreferences, sendTestNotification), `/ajustes/notificaciones` page with per-category toggles and test button; VAPID public key in `.env.local`
17. **Milestone 15 Step 5: Edge Function scaffold** — `supabase/functions/send-push/index.ts` written and committed. Handles `scheduled` (cron) and `test` (direct invoke with JWT) modes. `sendTestNotification` server action updated to invoke function after creating event (fails silently if not deployed). `tsconfig.json` excludes `supabase/functions/` from Next.js type check. `.gitignore` blocks `*.rtf`.
18. **Milestone 15 Step 6a: Edge Function deployed** — `send-push` deployed to Supabase (version 1, status ACTIVE, `verify_jwt: true`).
19. **Milestone 15 Step 6b: VAPID secrets set** — `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` set as Edge Function secrets in Supabase dashboard.
20. **Milestone 15 Step 7: Supabase Cron configured** — `pg_net` + `pg_cron` enabled (migration 014). Cron job `send-push-cron` registered (`* * * * *`, jobid 1). Uses anon key as Bearer token; function uses its own service role for DB access internally.
21. **Milestone 15 Step 8a: Infrastructure health confirmed** — Fixed `npm:web-push` → `https://esm.sh/web-push@3.6.7` (Deno runtime compatibility). Fixed `VAPID_PUBLIC_KEY` Edge Function secret (was stored with wrong encoding). Cron now returns HTTP 200 `{"processed":0,"sent":0,"failed":0}` every minute. Function deployed as version 6 (ACTIVE).

### Current Position: **Milestone 15 Step 8b — Live device push test**
Milestone 15 steps completed: 1–7, 8a (infrastructure).
Next: step 8b — subscribe on a real device at `/ajustes/notificaciones`, click "Probar notificación", verify push notification arrives, check `notification_delivery_attempts` in Supabase.

### Incomplete (in order)
- Milestone 15 step 8: live push test (manual — needs a subscribed device)
- Milestone 16: settings expansion (`/ajustes/dispositivos`, `/categorias`, `/privacidad`, password reset)
- Milestone 17: activity log + trash/archive UI
- Milestone 18: polish pass
- Milestone 19: offline shopping
- Milestone 20: PWA + install prompt
- Milestone 21: deploy to Vercel (ASK USER FIRST)
- Milestone 22: final review

## App Routes
| Route | Status |
|---|---|
| `/auth/login`, `/auth/register`, `/auth/join` | ✅ |
| `/dashboard` | ✅ |
| `/compra` (listas, pantalla lista, editar, papelera) | ✅ |
| `/menu` | ✅ |
| `/recordatorios` | ✅ |
| `/tareas` | ✅ |
| `/calendario` | ✅ |
| `/finanzas` | ✅ |
| `/documentos` | ✅ |
| `/deseos` | ✅ |
| `/ajustes` | ✅ |
| `/notificaciones` (actions only, no full page) | ✅ |
| `/ajustes/notificaciones` | ✅ |

## Database / Schema
- Migrations 001–013 applied to Supabase project `xzkavpjwvadqldauaabm`
- Key tables: households, profiles, household_members, household_invites, shopping_lists, shopping_list_items, pantry_items, expenses, recipes, meal_plans, reminders, chores, chore_assignments, calendar_events, payment_instances, subscriptions, documents, wishlist_items, notification_events, scheduled_notifications, push_subscriptions (table active — subscriptions upserted on subscribe)
- RLS helpers: `is_household_member(household_id)`, `is_household_owner(household_id)` — SECURITY DEFINER, perf-wrapped with `(select auth.uid())`
- Soft delete: `deleted_at`/`deleted_by` (app-filtered, not RLS)
- Archive: `archived_at`/`archived_by` on shopping_lists, household_documents

## Supabase Status
- Project: `xzkavpjwvadqldauaabm` (Postgres 17)
- Migrations through 014 applied (014 = pg_net + pg_cron)
- Edge Functions: `send-push` **DEPLOYED** (version 6, ACTIVE, `verify_jwt: true`) — VAPID secrets set and confirmed working
- Supabase Cron: **ACTIVE** — `send-push-cron` fires every minute (jobid 1), confirmed returning HTTP 200
- push_subscriptions table active — app will upsert subscriptions when user enables push
- **Import note:** `supabase/functions/send-push/index.ts` uses `https://esm.sh/web-push@3.6.7` (NOT `npm:web-push` — the npm: specifier fails in Deno Edge Runtime)

## Vercel Status
- **Not yet linked.** ASK USER before creating Vercel project.

## GitHub Status
- Repo: `andrewnhalls-creator/home-hub` (private)
- Branch: `main`, up to date with origin
- Latest: see `git log --oneline -1`

## Environment Variables
In `.env.local` (gitignored, must set manually):
```
NEXT_PUBLIC_SUPABASE_URL=https://xzkavpjwvadqldauaabm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_1Gp39QP9YwJPkbFf9X9c0w_TGpL0F07
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BCpWxtTgNzrnoIU8cnr1KjqHrjMgVCpYD_fsf4dUwZRm3U16B2vAqPYb34XGz_mE82Gsx_KCPRHWt4MQoCfQ-uw
```

Supabase Edge Function secrets (set in dashboard, NEVER committed):
- `VAPID_PUBLIC_KEY` ✅ set and verified working (2026-06-17)
- `VAPID_PRIVATE_KEY` ✅ set
- `VAPID_SUBJECT` ✅ set

Store the private key ONLY as a Supabase Edge Function secret — never commit it, never log it in full.

## Key Architectural Decisions
- Modal.tsx uses `createPortal(..., document.body)` — required because TopBar uses `backdrop-filter` which creates a containing block; all future modals benefit from this
- Forms use `noValidate` everywhere (avoids non-Spanish browser validation tooltips)
- `useActionState` + inner/outer component split (Fields + state-holder) to satisfy `react-hooks/set-state-in-effect` lint rule
- `usePushSubscription` hook: uses a lazy `useState(initFn)` initializer to detect push support synchronously (no setState in effect body), then an async-only effect for `getSubscription()`
- Calendar `is_private` field: the one deliberate non-shared data case
- No bank integrations ever — finance is manual only
- No Vercel cron — reminder scheduling uses Supabase Cron + Edge Function
- Notification bodies use generic privacy-safe text ("Tienes un pago próximo", not exact amounts)
- Test users: create via direct SQL into `auth.users` with ALL token columns set to `''` (not NULL) — bypasses GoTrue email rate limits
- Playwright runs from `/tmp/homehub-smoke`; prefix bash with `export NPM_CONFIG_CACHE=/tmp/npm-cache-home-hub`

## Security Rules (must persist forever)
- No secrets committed
- No service-role key client-side
- VAPID private key: server-side only, never in client code, never logged in full
- No force-push
- Repo stays private
- Ask before: adding connectors, installing tools, creating cloud resources, changing paid settings
- Confirm before: destructive/external actions, Vercel project creation, Edge Function secrets, destructive DB

## Things NOT to Redo
- Do not re-apply migrations 001–013
- Do not recreate any existing routes or components listed above
- Do not regenerate VAPID keys that already exist (but DO regenerate if using transcript-leaked ones)
- Do not re-run Playwright tests from the previous session

## Stop and Ask Before
- Creating Vercel project
- Setting Edge Function secrets (VAPID_PRIVATE_KEY, VAPID_SUBJECT)
- Any destructive DB action
- Any paid setting change
- Any force-push

## Exact Next Actions (fresh session)
Steps 1–7 and 8a (infrastructure) done. Continue with step 8b:
1. Read HANDOFF.md, NEXT_STEPS.md
2. Run `git status --short` and `git log --oneline -5`
3. Step 8b: Live device test — user subscribes at `/ajustes/notificaciones` on a real device, clicks "Probar notificación", verifies push arrives, checks `notification_delivery_attempts` in Supabase
4. Once step 8b confirmed: mark Milestone 15 complete and continue to Milestone 16
