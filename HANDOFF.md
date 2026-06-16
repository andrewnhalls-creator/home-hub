# Home Hub — Handoff Document
Generated: 2026-06-16

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
- Latest commit: `bc9ef99` — "Add in-app notification centre"
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

### Current Position: **Milestone 15 Step 2 (service worker)**
Milestone 15 steps completed: 1 (notification centre UI).
Next: step 2 — service worker registration for push notifications.

### Incomplete (in order)
- Milestone 15 steps 2–8: service worker → push subscriptions → `/ajustes/notificaciones` → VAPID keys → Edge Function → Supabase Cron → live push test
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
| `/ajustes/notificaciones` | ❌ not yet |

## Database / Schema
- Migrations 001–013 applied to Supabase project `xzkavpjwvadqldauaabm`
- Key tables: households, profiles, household_members, household_invites, shopping_lists, shopping_list_items, pantry_items, expenses, recipes, meal_plans, reminders, chores, chore_assignments, calendar_events, payment_instances, subscriptions, documents, wishlist_items, notification_events, scheduled_notifications, push_subscriptions (table exists in schema, not yet used)
- RLS helpers: `is_household_member(household_id)`, `is_household_owner(household_id)` — SECURITY DEFINER, perf-wrapped with `(select auth.uid())`
- Soft delete: `deleted_at`/`deleted_by` (app-filtered, not RLS)
- Archive: `archived_at`/`archived_by` on shopping_lists, household_documents

## Supabase Status
- Project: `xzkavpjwvadqldauaabm` (Postgres 17)
- Migrations through 013 applied
- Edge Functions: none deployed yet
- Supabase Cron: not yet configured
- push_subscriptions table exists in schema but no subscriptions stored yet

## Vercel Status
- **Not yet linked.** ASK USER before creating Vercel project.

## GitHub Status
- Repo: `andrewnhalls-creator/home-hub` (private)
- Branch: `main`, up to date with origin
- Latest: `bc9ef99`

## Environment Variables
In `.env.local` (gitignored, must set manually):
```
NEXT_PUBLIC_SUPABASE_URL=https://xzkavpjwvadqldauaabm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_1Gp39QP9YwJPkbFf9X9c0w_TGpL0F07
```

Still needed (NOT yet set):
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — VAPID public key (goes in `.env.local`)
- `VAPID_PRIVATE_KEY` — Supabase Edge Function secret (NEVER commit)
- `VAPID_SUBJECT` — e.g. `mailto:andrew.halls@hotmail.es` (Edge Function secret)

**IMPORTANT:** VAPID keys were generated in a prior session (`npx web-push generate-vapid-keys`) but the private key appeared in the transcript. **Regenerate fresh VAPID keys** before production:
```
npx web-push generate-vapid-keys
```
Store the new private key ONLY as a Supabase Edge Function secret — never commit it, never log it in full.

## Key Architectural Decisions
- Modal.tsx uses `createPortal(..., document.body)` — required because TopBar uses `backdrop-filter` which creates a containing block; all future modals benefit from this
- Forms use `noValidate` everywhere (avoids non-Spanish browser validation tooltips)
- `useActionState` + inner/outer component split (Fields + state-holder) to satisfy `react-hooks/set-state-in-effect` lint rule
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
1. Read HANDOFF.md, CLAUDE.md, BUILD_PLAN.md
2. Run `git status` and `git log --oneline -5`
3. Confirm current position: Milestone 15 Step 2 (service worker)
4. Regenerate VAPID keys: `npx web-push generate-vapid-keys`
5. Add `NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public>` to `.env.local`
6. Create `public/sw.js` — service worker with push event handler
7. Register service worker in a client component (layout or dedicated hook)
8. Store push subscription in `push_subscriptions` table via server action
9. Create `/ajustes/notificaciones` page — toggle categories, "Probar notificación"
10. Deploy VAPID Edge Function to Supabase
11. Set `VAPID_PRIVATE_KEY` and `VAPID_SUBJECT` as Supabase Edge Function secrets (ASK USER)
12. Configure Supabase Cron (ASK USER)
