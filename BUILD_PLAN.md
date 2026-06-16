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

## Milestone 9 — Reminders and chores
- `/recordatorios`: add/edit/complete, due date/time, assigned-to, category, repeat frequency, status, overdue styling, filters (hoy/semana/todos/completados).
- `/tareas`: add/edit/complete, assigned-to, frequency, next due date, overdue indicator, recurring roll-forward on completion, filters.
- Commit: `Add reminders and chores`. Push.

## Milestone 10 — Finance module
- `/finanzas` with tabs: Resumen, Pagos fijos, Gastos, Ahorro, Suscripciones.
- Fixed payments, expenses, savings goals + contributions, subscriptions CRUD.
- Monthly summary totals; simple "disponible estimado" if there's enough data (transparent arithmetic, clearly not advice).
- Commit: `Add finance module`. Push.

## Milestone 11 — Documents and wishlist
- `/documentos`: metadata CRUD, expiry/renewal highlighting.
- `/deseos`: CRUD with priority, target month, status workflow (idea → aprobado → comprado/descartado).
- Commit: `Add documents and wishlist`. Push.

## Milestone 12 — Settings and activity log
- `/ajustes`: household name (owner-editable), member list, invite code generation, profile display name, locale/currency display, sign out.
- Activity log writes on key actions across modules; rendered on dashboard.
- Commit: `Add settings and activity log`. Push.

## Milestone 13 — Polish
- Responsive pass on every screen at mobile width.
- Loading/empty/error states everywhere; toasts for save/delete feedback; delete confirmations.
- Zod validation + Spanish error messages on every form.
- Accessibility pass: labels, focus states, contrast, tap target sizes.
- Commit: `Polish UI and validation`. Push.

## Milestone 14 — PWA
- `manifest.ts` (or `manifest.json`), app icons, theme colour (terracotta), background colour (cream), apple-mobile-web-app meta tags.
- Commit: `Add PWA configuration`. Push.

## Milestone 15 — Deployment
- Confirm local production build succeeds.
- Ask user to confirm before creating/linking the Vercel project.
- Configure environment variables in Vercel.
- Deploy via Vercel MCP, check build/runtime logs, fix any errors.
- Commit: `Prepare Vercel deployment` (for any deployment-related code changes, e.g. `vercel.json`, build config fixes).

## Milestone 16 — Final review
- Re-check every screen for stray English text.
- Re-check no secrets committed.
- Smoke-test every module's core CRUD.
- Re-verify RLS (cross-household access denied).
- Re-check mobile usability.
- Deliver the final report (see `CLAUDE.md` / Phase 24 reporting format).

## Notes on sequencing

- Schema (Milestone 4) must exist before any module that reads/writes it.
- App shell (Milestone 3) must exist before module pages so navigation is consistent from the start, rather than retrofitted.
- Finance module is deliberately late (Milestone 10) since it's the most sensitive data and benefits from patterns already established by shopping/reminders/chores.
- PWA and deployment are last since they wrap a working app rather than gate its development.
