# Home Hub — Handoff Document
Updated: 2026-06-19 (Part A finance fixes — committed and pushed)

## Current state
Build passes, lint clean (warnings only, no errors), typecheck clean. All changes committed at `683ad0e`.

## What changed this session

### A1 — Disponible calculation fixed
- **File:** `components/finance/ResumenTab.tsx`
- **Bug:** Was computing `totalMonthlyIncome − totalOut` (all fixed + subs + expenses). Wrong.
- **Fix:** Now `accountBalance − (pendingThisMonthTotal + pendingSubsThisMonthTotal)`. Only unpaid obligations are subtracted from the actual account balance. Variable expenses are already reflected in the balance.
- **Subtitle changed:** "Este ciclo" → "Saldo − pendientes"
- **Worked example:** 4386,48 − 21,99 = 4364,49 ✓

### A2 — Mortgage overpayment calculator added
- **File:** `components/finance/PlanAhorroTab.tsx`
- Added `MortgageOverpaymentCalculator` component (interactive, not a static table)
- Inputs: saldo pendiente, tipo interés %, cuota mensual, importe a amortizar
- Pre-fills from active mortgage in DB
- Outputs: tiempo ahorrado (years/months) + interés ahorrado (€)
- Math: standard amortisation formula N = −ln(1 − rP/M) / ln(1+r)
- **File:** `components/finance/FinanceTabs.tsx` — now passes `mortgages` to `PlanAhorroTab`

### A3 — Dashboard stale counts + wording fixed
- **File:** `app/(app)/dashboard/page.tsx`
  - Now queries `payment_instances` for the current 25-to-25 cycle
  - Applies the same derived status logic as the finanzas page (`getSubscriptionCycleStatus` + instance override)
  - `proximosCount` = only genuinely pending fixed payments (not all active ones)
  - "Próximos pagos" list now shows only pending payments
  - `hasOverduePayments` now driven by `vencido` instances (not date comparison)
- **File:** `components/dashboard/MetricGrid.tsx`
  - Prop renamed: `activePayments` → `proximosCount`
  - Status text: `"pagos activos"` / `"Sin pagos activos"` → `"próximos pagos"` / `"Sin próximos pagos"`

## Design identity (Índigo Profundo · Dark-first · Two-tier glass)
- **Background:** deep indigo `#0D0B1F`
- **Brand accent:** saffron gold `#E8C547` (`--color-terracotta`)
- **Two-tier glass rule:** blur only on nav bars and modals/sheets
- **Icons:** Phosphor Icons v2 only
- **Canonical design doc:** `DESIGN.md`

## Production URL
https://home-hub-dun.vercel.app

## Last committed state
- Commit: `683ad0e` (Fix Disponible calc, add mortgage overpayment simulator, fix dashboard payment counts)

## SQL migrations applied
- 001–028 (full schema + finance cycle + income + subscriptions + category budgets + data fixes)

## Edge Function + pg_cron
- `send-push` v8 deployed; `send-push-cron` (every min) + `document-expiry-scan` (08:00 UTC daily)
