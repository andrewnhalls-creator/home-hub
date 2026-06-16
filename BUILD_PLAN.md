# BUILD_PLAN.md — Home Hub

Milestones in order. Do not skip ahead — later modules depend on the app shell, auth, and schema being in place. Commit and push at the end of each milestone once checks pass.

## Milestone 0 — Setup verification (read-only)
- Confirm working directory, git branch/status, remote.
- Confirm Node/npm versions.
- Confirm Supabase MCP reachable, identify the target project.
- Confirm Vercel MCP reachable, identify the team.
- Confirm GitHub CLI authenticated, repo `andrewnhalls-creator/home-hub` is private.
- Confirm no secrets committed, `.env*` ignored.
- **No commits in this milestone.**

## Milestone 1 — Planning files
- Create `CLAUDE.md`, `PRODUCT_REQUIREMENTS.md`, `DATA_MODEL.md`, `BUILD_PLAN.md`, `DESIGN_SYSTEM.md`, `SECURITY_AND_PRIVACY.md`, `TEST_PLAN.md`, `DEPLOYMENT_PLAN.md`.
- Commit: `Add project planning documents`. Push.

## Milestone 2 — App scaffold
- Scaffold Next.js (App Router, TypeScript, Tailwind, ESLint) into the current directory without deleting the planning docs, `.git`, `.gitignore`, or `.mcp.json`.
- Basic root layout with `es-ES` `<html lang>`, warm pastel background, placeholder home page.
- Configure Tailwind theme tokens from `DESIGN_SYSTEM.md`.
- Commit: `Scaffold Next.js app`. Push.

## Milestone 3 — Design system / app shell foundation
- Build `components/ui/` primitives: `Button`, `Card`, `Input`, `Select`, `Modal`, `EmptyState`, `Badge`, `ProgressBar`, `Toast`.
- Build `components/layout/AppShell.tsx`, `BottomNav.tsx`, `TopBar.tsx` with the 9 Spanish nav sections (Inicio, Compra, Menú, Recordatorios, Tareas, Finanzas, Documentos, Deseos, Ajustes) — not yet wired to real routes/data.
- Commit: `Add design system and app shell`. Push.

## Milestone 4 — Supabase foundation
- Install `@supabase/supabase-js`, `@supabase/ssr`.
- `lib/supabase/client.ts` (browser client), `lib/supabase/server.ts` (server client), `lib/supabase/middleware.ts` (session refresh middleware).
- `.env.example` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (empty values).
- Write `sql/001_initial_schema.sql`, `sql/002_rls_policies.sql`, `sql/003_seed_categories.sql` per `DATA_MODEL.md`. Review, then apply via Supabase MCP to the target project. Verify tables, RLS, and policies exist.
- Commit: `Add Supabase schema and auth foundation`. Push.

## Milestone 5 — Auth and household onboarding
- `/auth/login`, `/auth/signup` pages (Spanish copy per `PRODUCT_REQUIREMENTS.md`).
- `/onboarding`: create household or join via invite code (`redeem_household_invite` RPC).
- Middleware-based route protection: no auth → login; auth, no household → onboarding; auth + household → dashboard.
- `profiles` row created on first login if missing.
- Commit: `Add household onboarding`. Push.

## Milestone 6 — Dashboard
- `/dashboard`: greeting, weekly summary cards (shopping count, meals preview, upcoming reminders, pending chores, upcoming payments, savings progress, subscription renewals, recent activity).
- Friendly empty state when the household has no data yet.
- Commit: `Add dashboard`. Push.

## Milestone 7 — Shopping module
- `/compra`: list (active + collapsible completed), add/edit/delete, complete toggle, category/store/priority/notes, filter by category/store, search, quick-add input.
- Commit: `Add shopping module`. Push.

## Milestone 8 — Weekly menu and recipes
- `/menu`: Monday–Sunday week view, 4 meal slots, prev/next week navigation, add custom or recipe-based meal.
- Recipes list/detail/create/edit with ingredients; "Añadir ingredientes a la compra" action.
- Commit: `Add meal planning module`. Push.

---

**2026-06-16 reconciliation:** an updated requirements pass added push notifications (now core, not optional), a calendar module, per-occurrence payment history, and weekly shopping-spend tracking. Milestones 0–8 above are unchanged and already complete. Milestones 9 onward are renumbered and expanded below to fit the new scope; the original Milestone 9–16 plan is superseded by this section. Do not redo 0–8.

## Milestone 9 — Schema update for calendar, notifications, payment history, shopping spend
- Write and apply `sql/009_calendar_notifications_payments_shopping.sql` (or split into a few focused migrations, matching the established pattern of one concern per file): `calendar_events`, `payment_instances`, `shopping_lists`, `shopping_trips`, `notification_preferences`, `push_subscriptions`, `notification_events`, `notification_delivery_attempts`, `scheduled_notifications`, plus `shopping_items.shopping_list_id`, `expenses.shopping_list_id` (+ its unique partial index), and the `deleted_at`/`deleted_by`/`archived_at`/`archived_by` columns listed in `DATA_MODEL.md`.
- RLS for every new table (including the `is_private` exception on `calendar_events` and the `user_id = auth.uid()` extra scoping on `notification_preferences`/`push_subscriptions`/`notification_events`).
- Verify via `list_tables` + `get_advisors` (security and performance), same discipline as migrations 001–008.
- Pure schema work, no UI. Commit: `Add schema for calendar, notifications, payments, shopping spend`. Push.

## Milestone 10 — Reminders and chores
- `/recordatorios`: add/edit/complete, due date/time, assigned-to, category, repeat frequency, status, overdue styling, filters (hoy/semana/todos/completados), snooze/reschedule ("Posponer 10 minutos", "Posponer 1 hora", "Mañana", "Reprogramar").
- `/tareas`: add/edit/complete, assigned-to, frequency, next due date, overdue indicator, recurring roll-forward on completion, filters, same snooze/reschedule actions.
- Creating/editing/snoozing a reminder or chore with a due date writes/updates a `scheduled_notifications` row (category `recordatorios`/`tareas`); completing or deleting it cancels the row. No live push yet — that's Milestone 15. This just keeps the schema populated correctly from day one.
- Soft delete (not hard) for reminders, per `DATA_MODEL.md`.
- Commit: `Add reminders and chores`. Push.

## Milestone 11 — Calendar module
- `/calendario`, nav label "Calendario": monthly view, weekly view, "Próximos eventos" upcoming list.
- `calendar_events` CRUD: title, date, time/"Todo el día", repeat frequency, "Avisarme antes", "Evento privado", notes.
- Merge in (read-only on the calendar) reminders, chores (`next_due_date`), payment due dates (`payment_instances.due_date`), subscription renewals, document expiry dates, and planned meals.
- Recurring custom events expanded on read for the visible range — no occurrence table.
- Events with a lead time write a `scheduled_notifications` row (category `calendario`), same pattern as Milestone 10.
- Soft delete for calendar events.
- Commit: `Add calendar module`. Push.

## Milestone 12 — Finance module with payment history
- `/finanzas` with tabs: Resumen, Pagos fijos, Gastos, Ahorro, Suscripciones.
- Fixed payments CRUD; **payment instances** per occurrence ("Marcar como pagado", "Omitir este mes", "Cambiar importe solo este mes", paid date/by); expenses, savings goals + contributions, subscriptions CRUD.
- Resumen tab computed from `payment_instances`: upcoming, overdue, paid this month, total fixed this month, total still pending.
- Simple "disponible estimado" if there's enough data (transparent arithmetic, clearly not advice).
- Soft delete for fixed payments, expenses, savings goals, subscriptions.
- Subscriptions/payments due dates write `scheduled_notifications` rows (categories `pagos`/`suscripciones`).
- Commit: `Add finance module with payment history`. Push.

## Milestone 13 — Weekly shopping spend tracking
- Extend `/compra` with `shopping_lists` (name, week range, planned budget, actual total, status borrador/activa/comprada/archivada) and optional `shopping_trips` (per-store totals) per list.
- Spend analytics: current week, previous week, monthly grocery spend, 4-week average, planned-vs-actual, store breakdown.
- Marking a list "comprada" with a total creates/updates exactly one linked `expenses` row (category Supermercado) — verify the unique constraint actually prevents a duplicate, don't just trust the app logic.
- Soft delete + archive for shopping lists.
- Commit: `Add weekly shopping spend tracking`. Push.

## Milestone 14 — Documents and wishlist
- `/documentos`: metadata CRUD, expiry/renewal highlighting, archive support, document expiry writes a `scheduled_notifications` row (category `documentos`).
- `/deseos`: CRUD with priority, target month, status workflow (idea → aprobado → comprado/descartado).
- Commit: `Add documents and wishlist`. Push.

## Milestone 15 — Notification infrastructure (build in this exact order; live push is last)
1. In-app notification centre UI reading `notification_events` (unread badge, "Marcar como leído"/"Marcar todo como leído") — works immediately since Milestone 9's schema and Milestones 10–14's `scheduled_notifications` writes already exist; still no real push.
2. Service worker registration (`public/sw.js` or Next's built-in support) + browser notification-permission request flow.
3. Push subscription creation on the client (`PushManager.subscribe` with the VAPID public key) and storage in `push_subscriptions`.
4. `/ajustes/notificaciones`: master toggle, per-category toggles, lead time, quiet hours, "solo lo asignado a mí", connected-devices list, "Probar notificación" (calls a simple test-send path before the full Cron pipeline exists).
5. Generate VAPID keys (locally, no external account needed) and store the private key as a Supabase Edge Function secret; public key as `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
6. Supabase Edge Function: claims due `scheduled_notifications`, checks recipient preferences/quiet hours, sends Web Push, logs `notification_delivery_attempts`, writes `notification_events`.
7. Supabase Cron schedules the Edge Function (and the `generate_due_notifications()` occurrence-scan function) on a short interval — **not Vercel cron**.
8. Verify end-to-end with the "Probar notificación" button before considering this milestone done.
- Privacy: notification bodies use the approved generic phrasing from `SECURITY_AND_PRIVACY.md` — never exact amounts or balances.
- Commit per numbered step above (these are substantial enough to warrant separate commits, not one giant one), e.g. `Add in-app notification centre`, `Add push subscription and service worker`, `Add notification settings page`, `Add scheduled push delivery via Supabase Edge Function and Cron`.

## Milestone 16 — Settings expansion
- `/ajustes`: household name (owner-editable), member list, invite code generation, profile display name, locale/currency display, sign out.
- `/ajustes/dispositivos`: device/session list ("Dispositivos", "Sesiones activas", "Último acceso", "Revocar acceso", "Quitar este dispositivo"), tied to `push_subscriptions` deactivation.
- `/ajustes/categorias`: create/rename/recolour/archive categories per module; never hard-delete a category in use.
- `/ajustes/privacidad`: export household data as JSON, finance/shopping-history/documents as CSV.
- `/auth`: forgot/reset password, change password, change email.
- Commit: `Add settings expansion (devices, categories, privacy export, password reset)`. Push.

## Milestone 17 — Activity log and soft-delete/archive UI
- Activity log writes on key actions across all modules (including the new ones); rendered on dashboard.
- "Historial"/"Creado por"/"Actualizado por" surfaced on finance, payments, savings goals, documents, reminders, chores, calendar events, and shopping lists.
- Wire `deleted_at`/`archived_at` into delete/archive/restore UI for the modules that have them — "Papelera" (trash) view, "Restaurar", "Archivar".
- Commit: `Add activity history and soft-delete/archive UI`. Push.

## Milestone 18 — Polish
- Responsive pass on every screen (including all new modules) at mobile width.
- Loading/empty/error states everywhere; toasts for save/delete feedback; delete confirmations.
- Zod validation + Spanish error messages + `noValidate` on every form (already standard since Milestone 10's bugfix — verify it's still true for every new form added since).
- Accessibility pass: labels, focus states, contrast, tap target sizes.
- Commit: `Polish UI and validation`. Push.

## Milestone 19 — Offline support for shopping
- Cache recently-loaded shopping items for offline viewing; queue completions made offline; sync on reconnect. Scoped to the shopping list only — not a general offline framework.
- Commit: `Add offline support for shopping list`. Push.

## Milestone 20 — PWA and app install guidance
- `manifest.ts`, app icons, theme colour (terracotta), background colour (cream), apple-mobile-web-app meta tags.
- "Instalar la app" screen/modal: per-platform instructions (iPhone, Android, Mac, Windows), explanation of push notification platform requirements (notification permission, supported browser, install-to-home-screen where the platform requires it, OS-level notifications enabled), "Probar notificación" entry point.
- Commit: `Add PWA configuration and install guidance`. Push.

## Milestone 21 — Deployment
- Confirm local production build succeeds.
- Ask user to confirm before creating/linking the Vercel project.
- Configure environment variables in Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`); confirm the VAPID private key and any Edge Function secrets are set in Supabase, not Vercel.
- Deploy via Vercel MCP, check build/runtime logs, fix any errors.
- Confirm Supabase Cron jobs are active and the Edge Function is deployed.
- Commit: `Prepare Vercel deployment` (for any deployment-related code changes).

## Milestone 22 — Final review
- Re-check every screen for stray English text.
- Re-check no secrets committed (including no VAPID private key, no push subscription secrets in logs).
- Smoke-test every module's core CRUD, including a real push notification end-to-end on a real device.
- Re-verify RLS (cross-household access denied; a user cannot see their partner's push subscriptions or notification preferences).
- Re-check mobile usability and the install-guidance flow.
- Deliver the final report (see `CLAUDE.md` / Phase 24 reporting format).

## Notes on sequencing

- Schema (Milestone 4, extended in Milestone 9) must exist before any module that reads/writes it.
- App shell (Milestone 3) must exist before module pages so navigation is consistent from the start, rather than retrofitted.
- Finance and shopping-spend are deliberately mid-sequence (Milestones 12–13) since they benefit from patterns already established by shopping/reminders/chores, and because payment history needs the schema from Milestone 9.
- Notification infrastructure (Milestone 15) is deliberately built in-app-first, live-push-last — see the numbered order within that milestone. Don't jump to the Edge Function/Cron step before the tables, UI, and subscription storage are working.
- PWA and deployment are last since they wrap a working app rather than gate its development. Push notifications fundamentally need HTTPS and (for iOS) installation, so a real device test isn't meaningful until close to deployment anyway.
