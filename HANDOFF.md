# Home Hub — Handoff Document
Updated: 2026-06-19 (Confirmed Compra ⇄ Menú toggle complete)

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

## Last committed state
- Commit: `dbfae24` — Stage 4: Plan de ahorro y hipoteca rework

## SQL migrations applied
- 001–031 (full schema through bank_account + debts)

## Edge Function + pg_cron
- `send-push` v8 deployed; `send-push-cron` (every min) + `document-expiry-scan` (08:00 UTC daily)
