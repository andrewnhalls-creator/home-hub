# Home Hub — Handoff Document
Updated: 2026-06-17 (Milestone FIN-9 complete)

## Current milestone: FIN-9 COMPLETE ✓ (deploy pending)

## Status
All functional milestones (1–22), UI milestones (UI-0 through UI-9), and FIN-9 complete.
Code pushed to origin main. **Vercel deploy not yet run — needs `npx vercel --prod`.**

## Last session: FIN-9 — Mortgage tracking (2026-06-17)

### Database (migration 016_mortgages.sql — APPLIED)
- `mortgages`: id, household_id, name, lender, original_principal, current_balance, monthly_payment, interest_rate, start_date, end_date, payment_day, currency, status (activa/pagada/cancelada), notes, soft-delete columns
- `mortgage_payments`: id, household_id, mortgage_id, due_date, paid_date, amount, principal_amount, interest_amount, extra_payment, status (pendiente/pagado/omitido), paid_by, notes
- Both tables: RLS via `is_household_member(household_id)`, indexes, `set_updated_at` trigger

### Types & validation
- `lib/types.ts`: `Mortgage`, `MortgagePayment`, `MortgageStatus`, `MortgagePaymentStatus`
- `lib/validations/finance.ts`: `mortgageSchema`, `mortgagePaymentSchema`

### Components
- `MortgageForm.tsx` — create/edit mortgage (name, lender, principal, balance, cuota, tasa, fechas, día de pago, notas)
- `MortgagePaymentForm.tsx` — register payment (fecha, importe, capital/intereses, extra, estado)
- `MortgageTab.tsx` — full tab: progress bar, stat grid, próximo pago card, payment history toggle, modals for add/edit/delete mortgage + add payment

### Server actions
- `mortgageActions.ts`: `upsertMortgage`, `deleteMortgage`, `addMortgagePayment`, `markMortgagePaymentPaid`, `deleteMortgagePayment`

### Page wiring
- `finanzas/page.tsx`: fetches mortgages + mortgage_payments, passes to FinanceTabs
- `FinanceTabs.tsx`: Hipoteca tab now renders `<MortgageTab>` (was EmptyState)

### Also fixed
- `layout.tsx` + `manifest.ts`: theme-color corrected to `#0a84ff` (was old terracotta `#c96b4b`)

## Production URL
https://home-hub-dun.vercel.app

## Deploy command
```
npx vercel --prod
```
(GitHub-triggered deploys blocked on Hobby plan — always use CLI)

## Last known good state
- Build, lint, typecheck all pass
- Committed: c36d8b3
- Pushed to origin main
- Migration 016_mortgages applied to Supabase

## Remaining work
- **Deploy**: run `npx vercel --prod` to publish FIN-9
- **Push notification test**: end-to-end device test still pending (infrastructure working)
- **Post-MVP**: global search, web fonts, animated transitions

## Previously done (summary)
- Milestones 1–22: full functional app, Spanish UI, RLS, push notifications, PWA, offline shopping
- UI-0 through UI-9: design system redesign, navigation, dashboard, finance, calendar, polish, Apple Home Glass palette
- FIN-9: mortgage tracking with full CRUD and payment history
