# Home Hub — Handoff Document
Updated: 2026-06-19 (Stage 2 finance data model overhaul — committed and pushed)

## Current state
Build passes, lint clean (0 errors, warnings only), typecheck clean. All changes committed and pushed.

## What changed (Stages 1 & 2)

### Stage 1 — Bug fixes
- KPI cards desync: added `revalidatePath("/dashboard")` to all finance actions
- Shopping list live update: fixed derived-state sync pattern in `ShoppingList.tsx`
- AI button blur: removed illegal `backdropFilter` from `Toast.tsx`

### Stage 2 — Finance data model overhaul
- **Editability:** all finance entries now editable — expenses, savings goals, income sources, subscriptions, fixed payments
- **`bank_account` field:** added `text check ('ING'|'BBVA'|'Revolut')` nullable column to `income_sources`, `fixed_payments`, `expenses`, `subscriptions`, `savings_contributions` (migration 030, applied)
- **`debts` table:** new table with balance, monthly_payment, payment_day, interest_rate, lender, start_date, notes; full RLS via `is_household_member`; soft delete; `set_updated_at` trigger (migration 031, applied)
- Updated: `lib/types.ts`, `lib/validations/finance.ts`, `actions.ts`, `incomeActions.ts`, all finance tab components, `DATA_MODEL.md`

## Design identity
- Background: deep indigo `#0D0B1F`; accent: saffron gold `#E8C547`; two-tier glass rule enforced
- Canonical design doc: `DESIGN.md`

## Production URL
https://home-hub-dun.vercel.app

## Last committed state
- Commit: `ac16465` — Stage 2: Finance data model overhaul — editability, bank_account, debts

## SQL migrations applied
- 001–031 (full schema through bank_account + debts)

## Edge Function + pg_cron
- `send-push` v8 deployed; `send-push-cron` (every min) + `document-expiry-scan` (08:00 UTC daily)
