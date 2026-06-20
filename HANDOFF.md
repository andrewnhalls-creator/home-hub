# Home Hub — Handoff Document
Updated: 2026-06-20 (Finanzas UI overhaul + audit)

## Current state
Build passes, lint clean (0 errors, warnings only), typecheck clean. All changes committed and pushed.
All 4 stages of the finance overhaul are complete.
Compra ⇄ Menú toggle (SHOPA_COMPARISON.md) is also complete — was committed in 5d95428 prior to Stage 1–4, confirmed fully wired: SegmentedToggle on both /compra and /menu, primary-gold GenerateListButton, "Ver semana →" reverse link in ShoppingListDetail, migration 029 applied (source_menu_week_start column live in DB).

## What changed (Stages 1–4)

### Stage 1 — Bug fixes
- KPI cards desync: `revalidatePath("/dashboard")` added to all finance actions
- Shopping list live update: fixed derived-state sync in `ShoppingList.tsx`
- AI button blur: removed illegal `backdropFilter` from `Toast.tsx`

### Stage 2 — Finance data model overhaul
- All finance entries now editable
- `bank_account` field (ING/BBVA/Revolut) added to income_sources, fixed_payments, expenses, subscriptions, savings_contributions (migration 030)
- `debts` table added with full RLS + soft delete (migration 031)

### Stage 3 — Finanzas page restructure
- Landing = Resumen only + grid icon to open 7-section picker
- Sub-pages: back arrow + horizontal scrollable pill strip (page-slider)
- 7 sub-pages in order: Ingresos · Gastos fijos · Suscripciones · Gastos variables · Gastos · Plan de ahorro y hipoteca · Deuda
- DeudaTab built: list/add/edit/delete debts with summary card
- Desktop sidebar updated

### Stage 4 — Plan de ahorro y hipoteca rework
- Removed all phases/fases concept from PlanAhorroTab
- No objectives/targets displayed — each plan shows: monthly amount + projected year total + months left until Dec
- Fixed monthly amounts: Emergencia 400€/mes · Amortización hipoteca 700€/mes · Inmobiliario 300€/mes
- "Fondo compra casa" → renamed to "Inmobiliario" in display
- "Añadir fondos" button per plan card → modal with amount + bank account selector
- MortgageOverpaymentCalculator kept (months saved + interest saved for lump payment)
- SavingsTab removed from plan-ahorro combined view (absorbed into PlanAhorroTab)
- SavingsSimulator fund label "Compras casa" → "Inmobiliario"

## Production URL
https://home-hub-dun.vercel.app

## AI assistant — fully wired (2026-06-19)
All execute actions now live:
- add/remove/update_shopping_item — hard delete; bulk "all/todo" wipes uncompleted list; ilike lookup by name
- add/complete/update_task — complete handles puntual (→ "hecho") and recurring (advances date); ilike lookup by title
- add/update_reminder — ilike lookup by title; soft-delete-aware query
- Execute route returns ok:false for real errors (not found) so the UI surfaces the message; ok:true/executed:false = "próximamente"
- Savings goal "Inmobiliario" already correctly named in DB — no migration needed
- All 12 AI env vars confirmed present in .env.local; Vercel Production env vars already set per original setup

## AI assistant router (added 2026-06-19)
- `POST /api/assistant` — command parser endpoint, separate from the existing `/api/ai` chatbot
- Provider fallback order: groq → cloudflare → openrouter → gemini (overrideable via `AI_PROVIDER_ORDER`)
- Allowed actions: add_shopping_item, update_shopping_item, remove_shopping_item, add_task, update_task, complete_task, add_reminder, update_reminder, clarify
- Execution wired for: add_shopping_item, add_task, add_reminder (pass `autoExecute: true` in body)
- Execution TODOs: update/remove/complete actions need safe lookup-by-name logic before wiring
- All 5 manual test cases pass; pronoun guard prevents model filling in "it" instead of clarifying
- New files: `lib/ai/action-schema.ts`, `lib/ai/provider-router.ts`, `lib/ai/providers/{groq,cloudflare,openrouter,gemini}.ts`, `lib/ai/execute-assistant-action.ts`, `app/api/assistant/route.ts`

## Finanzas UI overhaul (2026-06-20)
Commit `81f94b5` — all changes committed and deployed to production.

### Pager / navigation
- Dot indicators replaced with scrollable named tab strip (chips + X/N counter + arrows)
- DashboardPager: two-ref fix (`scrollContainerRef` on outer scroll div, `tabListRef` on inner flex div) using `getBoundingClientRect` — active chip now centres correctly in the strip
- Menú button restored as a separate pill (always visible, opens section picker grid)
- Touch swipe between pages preserved

### Layout
- AppShell main content wrapper: added `min-w-0` — fixes 800px intrinsic min-width overflow that caused all finance content to bleed off-screen on 390px viewports

### Tab audit — all tabs now consistent
- **IngresoTab**: 44px tap targets, `uppercase tracking-wider` removed
- **FixedPaymentsTab**: 44px tap targets, `uppercase tracking-wider` removed
- **SubscriptionsTab**: 44px tap targets, `uppercase tracking-wider` removed
- **PresupuestosTab (Gastos variables)**: full edit + delete wired; all "presupuesto" labels renamed to "gasto variable"
- **ExpensesTab**: buttons updated to `h-11 w-11 rounded-full` with focus ring, transition, and `active:scale-[0.9]`
- **MortgageTab**: history delete button fixed to 44px tap target
- **ResumenTab**: two `uppercase tracking-wider` violations removed from hero card labels
- **DeudaTab**, **PlanAhorroTab**: already correct, no changes needed

### Housekeeping
- Playwright removed (`@playwright/test` uninstalled, config/tests/.github deleted, `.gitignore` restored) — was added by verify tool, not needed in the project

## Last committed state
- Commit: `81f94b5` — Fix finanzas pager scroll, mobile overflow, and tap target consistency

## SQL migrations applied
- 001–031 (full schema through bank_account + debts)

## Edge Function + pg_cron
- `send-push` v8 deployed; `send-push-cron` (every min) + `document-expiry-scan` (08:00 UTC daily)
