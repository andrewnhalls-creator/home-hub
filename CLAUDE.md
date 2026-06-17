# CLAUDE.md — Home Hub project rules

These rules apply to every Claude Code session working in this repository. Read this file before making changes.

## Project

- **Name:** Home Hub
- **Purpose:** A private, shared household management app for two people (a married couple) to organise shopping lists, weekly menus, recipes, reminders, chores, a calendar, fixed payments with payment history, variable expenses (including weekly grocery spend tracking), savings goals, subscriptions, household documents, a wishlist, push notifications, and household planning, in one place.
- **Audience:** Exactly two named users per household (owner + partner), invite-only. Not a public or multi-tenant SaaS product.

## Language and locale (non-negotiable)

- **All user-facing text must be in Spanish (Spain). Do not use English in the UI unless it is a brand name or an unavoidable technical term.**
- Locale: `es-ES`.
- Currency: Euro, symbol `€`, formatted with `Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })`.
- Dates: `dd/MM/yyyy`. Times: 24-hour (`HH:mm`).
- Week starts on **Monday** everywhere (menu planner, date pickers, week views).
- Code identifiers (variables, functions, types, files, table/column names) are in **English**. Only rendered UI text, labels, button text, validation messages, empty states, and navigation are Spanish.
- When in doubt about microcopy tone: warm, natural, household Spanish — not corporate, not robotic, not machine-translated. Use vocabulary a Spanish couple would actually use at home.

## Design style

- Warm, soft, friendly, modern. Pastel palette. Light warm background (cream/sand), never pure white (`#FFFFFF`) as a primary background.
- Primary action colour: terracotta/warm coral. Secondary accents: sage green, soft amber, muted rose.
- Avoid cold corporate blue as a dominant colour. Avoid harsh pure black/white contrast except where required for accessibility (e.g. body text colour).
- Mobile-first. Rounded corners, soft shadows, generous spacing, large tap targets (min 44×44px).
- See `DESIGN_SYSTEM.md` for the full palette, type scale, and component rules. Use the Tailwind theme tokens defined there — do not invent new ad hoc colours in components.

## Tech stack

- Next.js (App Router) + TypeScript, React.
- Tailwind CSS for styling.
- Supabase (Postgres + Auth + RLS) as the only backend. `@supabase/supabase-js` + `@supabase/ssr`.
- Zod for validation, `react-hook-form` + `@hookform/resolvers` for forms.
- `date-fns` (with `es` locale) for date handling. `lucide-react` for icons. `clsx` + `tailwind-merge` for class composition.
- Deployed on Vercel (hosting only). **Supabase Edge Functions + Supabase Cron (pg_cron) own all scheduled/background processing** — reminder/notification due-date scanning, recurring occurrence generation, and Web Push delivery. Never rely on Vercel Hobby cron for anything time-sensitive (it is not reliable enough for reminder timing).
- Web Push (service worker + VAPID) is a **core v1 feature**, not optional. See `PRODUCT_REQUIREMENTS.md` notification section and `SECURITY_AND_PRIVACY.md` for content rules.
- PWA-installable (manifest + icons + install-guidance screen). Push notifications on iOS require the PWA installed to the home screen (iOS 16.4+) — this is a real platform constraint to surface in the UI, not a bug.
- Limited offline support: the shopping list view caches recently-loaded items and queues completions made while offline (see `PRODUCT_REQUIREMENTS.md`). Do not build full offline sync for every module in v1.

## Safety rules

- Do not delete important files without explaining why first.
- Never commit `.env`, `.env.local`, service-role keys, tokens, secrets, or `.claude/` local settings. These are already in `.gitignore` — do not remove them from it.
- Never put the Supabase **service role key** in any client-side code, browser bundle, or `NEXT_PUBLIC_*` variable. Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are client-safe.
- No bank integrations, no Open Banking APIs, no connections to real financial institutions, no automatic transaction import. Finance modules are manual-entry only.
- No financial, tax, or legal advice in copy or features — this is a household planner, not an accounting or advisory product.
- Do not make destructive Supabase changes (dropping tables/columns, deleting data) without first explaining exactly what will change.
- Never force-push. Never make the GitHub repo public. Keep it private.
- Confirm with the user before creating or linking new external resources (new Supabase project, new Vercel project) if one already exists — reuse existing infra unless told otherwise.
- The VAPID private key (Web Push) is a server-only secret: it lives in Supabase Edge Function secrets, never in `NEXT_PUBLIC_*`, never committed, never logged. Only the VAPID **public** key is client-safe.
- Never log a full push subscription (endpoint + keys) or full notification payload content in plaintext server logs; log delivery status/IDs only (see `notification_delivery_attempts`).
- Push/notification body text must never contain exact amounts, balances, or other sensitive finance details — use generic phrasing (see `SECURITY_AND_PRIVACY.md` "privacy-safe notification examples"). Sensitive detail is only shown in-app after login.
- Soft delete, not hard delete, for: finance records, fixed payments, savings goals, documents, calendar events, reminders, shopping lists/spend history. Use `deleted_at`/`deleted_by` (and `archived_at`/`archived_by` where archiving applies) rather than `DELETE FROM`. Other modules (shopping items, chores, recipes, wishlist) keep hard delete with a confirmation dialog, since they're low-stakes and high-churn.

## Git workflow

- Before starting major changes: run `git status` and confirm the tree is clean / changes are expected.
- Commit at logical milestones with clear, descriptive messages (see `BUILD_PLAN.md` for the suggested commit sequence).
- Stage specific files by name; avoid `git add -A` / `git add .` to prevent accidentally committing secrets or build artifacts.
- After major changes: run lint/typecheck/build (whatever is configured) and only commit once they pass.
- Never amend commits that are already pushed; create new commits instead.
- Push to `origin main` after each milestone commit unless told otherwise.

## Supabase rules

- Treat Supabase as the single source of truth for schema. SQL migrations live in `sql/` and are reviewed before being applied via the Supabase MCP tools.
- Every household-scoped table must have **Row Level Security enabled** with policies restricting access to members of that household. No table is publicly readable.
- Use the `is_household_member(household_id uuid)` helper (or equivalent) in policies rather than duplicating membership logic.
- Client code uses the anon key via `@supabase/ssr` browser/server helpers in `lib/supabase/`. Server-only operations that need elevated privileges must run in server contexts (Route Handlers/Server Actions), never in client components.

## Vercel rules

- Environment variables are configured in the Vercel project dashboard/MCP, never committed to the repo.
- Ask the user before creating or linking a new Vercel project.
- Check build/deploy logs via the Vercel MCP tools when diagnosing failures; fix root causes in code, don't paper over build errors.

## No secrets / no bank connector rule

- No `.env*` files are ever committed. `.env.example` documents variable names only, with empty values.
- No bank connector, Open Banking, PSD2, or similar integration is ever added to this project.

## Commit rules

- One milestone = one commit (or a small number of focused commits), not one giant commit for the whole app.
- Commit message style: short imperative summary line (e.g. `Add shopping module`), no fluff.

## Testing rules

- Before committing meaningful code, run `npm run lint`, `npm run typecheck`, and `npm run build`. Do not ignore TypeScript errors or silence them with `any`/`@ts-ignore` to make the build pass.
- See `TEST_PLAN.md` for the manual test checklist to run through for each module before considering it done.

## App architecture conventions

- App Router routes under `app/`, one folder per Spanish-named section (`compra/`, `menu/`, `recordatorios/`, `tareas/`, `calendario/`, `finanzas/`, `documentos/`, `deseos/`, `ajustes/` with sub-routes `ajustes/notificaciones`, `ajustes/privacidad`, `ajustes/categorias`, `ajustes/dispositivos`). `buscar/` (global search) is post-MVP, design-ready but not built in v1.
- Shared UI primitives in `components/ui/`, layout shell in `components/layout/`, feature-specific components grouped by module (`components/shopping/`, `components/finance/`, etc.).
- Supabase client/server helpers in `lib/supabase/`. Shared formatting (currency, dates) in `lib/format.ts`. Shared constants (categories, enums) in `lib/constants.ts`. Shared TypeScript types in `lib/types.ts`.
- Keep components small and focused; avoid massive files. Prefer simple, readable, robust code over clever abstractions.
- Data fetching for a household always filters by `household_id`; never trust a client-supplied household id without checking the user is a member (RLS is the backstop, but queries should still be scoped correctly).

## Naming conventions

- Database: `snake_case` tables/columns, plural table names (`shopping_items`, `savings_goals`).
- TypeScript: `camelCase` variables/functions, `PascalCase` components/types, files for components in `PascalCase.tsx`, route files follow Next.js conventions (`page.tsx`, `layout.tsx`).
- Route segments and nav labels are Spanish; component/prop/file names are English.

## Accessibility expectations

- Sufficient colour contrast for text on pastel backgrounds (verify against WCAG AA, adjust palette shades if a pastel fails).
- All interactive elements reachable and operable via keyboard, with visible focus states.
- Form inputs have associated labels; errors are announced via `aria-describedby`/`aria-invalid` where relevant.
- Tap targets at least 44×44px on mobile. Icons used as buttons have `aria-label`s in Spanish.

## Mobile-first requirement

- Design and build for small screens first (bottom navigation, single-column layouts, large touch targets), then enhance for larger screens (sidebar nav, multi-column layouts).
- Test every new screen at a narrow mobile viewport before considering it done.

## Definition of done (every module)

A module is not done until: the page exists; data saves to and loads from Supabase; RLS is verified (not just assumed); every visible string is Spanish (Spain); the mobile layout (≈375–390px) works; it has an empty state, a loading state, and an error state; forms have Zod validation with Spanish messages and `noValidate` set; destructive actions have a confirmation step; it's been manually exercised against the live Supabase project (not just typechecked); `npm run lint`, `npm run typecheck`, and `npm run build` all pass; and the change is committed and pushed.

## Working agreement

- Before major changes, check `git status`. After major changes, run relevant checks and commit.
- Follow the phases in `BUILD_PLAN.md` in order; don't skip ahead to later modules before earlier foundational work (auth, schema, app shell) is in place.
- No placeholder buttons that silently do nothing — either implement the action or clearly mark it as not-yet-available in the UI copy.
- No fake/demo data rendered as if real in production views; use proper empty states instead.

## Context-saving protocol

1. Work one stage at a time.
2. Do not continue automatically into the next stage.
3. At the end of each stage:
   - Update `HANDOFF.md`
   - Update `NEXT_STEPS.md`
   - Update `KNOWN_ISSUES.md` if needed
   - Commit and push
   - Stop and wait for the user to say continue
4. Keep `HANDOFF.md` concise — current state only, not a full history.
5. Keep `NEXT_STEPS.md` focused on the next 1–3 stages only.
6. Do not paste long file contents into chat.
7. Do not read large files unless required by the current stage.
8. Do not read `package-lock.json` unless debugging dependencies.
9. Do not inspect `node_modules/`, `.next/`, build output, generated files, or cache folders.
10. Prefer targeted file reads over broad repository scans.
11. Prefer `git status --short`, `git diff --stat`, and `git diff --name-only` over full `git diff`.
12. For build/lint/test output, use `tail` or targeted error output instead of dumping full logs.
13. Do not call Supabase MCP unless the current stage requires database, auth, RLS, Edge Functions, secrets, or Cron.
14. Do not call Vercel MCP unless the current stage requires deployment, env vars, domains, or build/deploy status.
15. Do not add new MCP servers without explicit user approval.
16. Do not use browser/search/documentation MCP tools unless explicitly approved.
17. Do not include secrets, private keys, `.env.local` values, or service role keys in summaries, logs, docs, commits, or handoff files.
18. If context seems to be getting large, stop early, update handoff files, commit, push, and tell the user to start a fresh session.
19. Use repository files and Git history as the source of truth, not chat history.
