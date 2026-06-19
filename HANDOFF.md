# Home Hub — Handoff Document
Updated: 2026-06-19 (Stage 3 Finanzas restructure — committed and pushed)

## Current state
Build passes, lint clean (0 errors, warnings only), typecheck clean. All changes committed and pushed.

## What changed (Stages 1–3)

### Stage 1 — Bug fixes
- KPI cards desync: `revalidatePath("/dashboard")` added to all finance actions
- Shopping list live update: fixed derived-state sync in `ShoppingList.tsx`
- AI button blur: removed illegal `backdropFilter` from `Toast.tsx`

### Stage 2 — Finance data model overhaul
- All finance entries now editable
- `bank_account` field (ING/BBVA/Revolut) added to income_sources, fixed_payments, expenses, subscriptions, savings_contributions (migration 030)
- `debts` table added with full RLS + soft delete (migration 031)

### Stage 3 — Finanzas page restructure
- **Landing = Resumen only.** Grid icon (SquaresFour) at top right opens a 2-column section picker.
- **Sub-pages** navigated via: section picker OR back arrow + horizontal scrollable pill strip.
- **7 sub-pages in order:** Ingresos · Gastos fijos · Suscripciones · Gastos variables · Gastos · Plan de ahorro y hipoteca · Deuda
- **Presupuestos → Gastos variables** renamed everywhere in the UI.
- **Ahorro + Plan de ahorro + Hipoteca** merged into single "Plan de ahorro y hipoteca" sub-page (SavingsTab + PlanAhorroTab + MortgageTab stacked; Stage 4 will rework this).
- **DeudaTab** built: list/add/edit/delete debts, total balance + monthly summary card.
- Desktop sidebar updated to match new 8-tab structure (Resumen + 7 sub-pages).

## Files changed in Stage 3
- `components/finance/FinanceTabs.tsx` — full restructure
- `components/finance/DeudaTab.tsx` — new file
- `app/(app)/finanzas/page.tsx` — added debts query

## Production URL
https://home-hub-dun.vercel.app

## Last committed state
- Commit: `ef33f6f` — Stage 3: Finanzas page restructure

## SQL migrations applied
- 001–031 (full schema through bank_account + debts)

## Edge Function + pg_cron
- `send-push` v8 deployed; `send-push-cron` (every min) + `document-expiry-scan` (08:00 UTC daily)
