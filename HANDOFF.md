# Home Hub — Handoff Document
Updated: 2026-06-19 (finance module major bug-fix + UI overhaul)

## Current state
Build passes, lint clean (warnings only, no errors), typecheck clean. Changes staged but NOT yet committed — stopped early for context compaction.

## What changed this session

### Critical bug fixed: paid/pending cycle logic
- **Root cause**: `ensureCurrentMonthPaymentInstances` used calendar month, not 25-to-25 cycle → DIGI/Movistar got wrong due_dates (June 28/29, outside the cycle)
- **Fix**: `actions.ts` — now uses `getCurrentCycleDates()` + `getCycleDueDate()` so due_dates respect the 25th→25th cycle
- **Fix**: `lib/cycle.ts` — added `getCycleDueDate()` helper; `getSubscriptionCycleStatus` now uses it
- **Fix**: `FixedPaymentsTab.tsx` — derives display status from `due_day` (same as SubscriptionsTab does), groups payments by category, shows paid/pending summary
- **Fix**: `page.tsx` — KPI calculations now use derived status: `overdueCount` only counts explicitly `vencido` instances; `upcomingCount` includes pending monthly subs; `paidThisMonthTotal` reflects derived "pagado"

### Data fixes applied to DB (migration 028)
- DIGI: `due_day=28` (now derives "Pagado" ✅)
- Movistar: `due_day=29`, amount `9.99→4.99` ✅
- Gasolina: `due_day=1` (now derives "Pagado" ✅)
- Seguro de hogar: `renewal_date 2027-07-01 → 2026-07-01` ✅
- IBI: amount `318.29 → 159.15` (this year half), notes updated ✅
- `households.current_balance = 4386.48` ✅
- New `fixed_payments`: "Alquiler julio (último mes)" 925 €, "Tasa de basuras" 53.20 € → both under new "Pago extraordinario" category ✅
- Hipoteca first mortgage payment: `mortgage_payments` row inserted for 2026-08-01 → "Próximo pago" now shows 01/08/2026 ✅
- Andrew quincenal pension notes updated with anchor date 2026-07-01 ✅

### UI changes
- **Renamed "Pagos" tab → "Gastos Fijos"** throughout (tab value, label, AI prompt references)
- **ResumenTab** reworked: hero balance card (saldo en cuenta + disponible), tappable KPI chips, paid/pending split rows for fixed payments and subscriptions (with progress bars), tappable navigation to sub-tabs
- **SubscriptionsTab**: "Trimestrales" section renamed → "Otros ciclos" (Real Debrid is 180-day, not quarterly)
- **PlanAhorroTab**: savings simulator added (¿Cuándo llegaré? / ¿Cuánto necesito?), mortgage amortization reference table (collapsible), prepayment guide (collapsible)
- **ExpensesTab**: category name now shown on each expense row (reinforces Presupuestos linkage)
- **FinanceTabs**: new navigation callbacks (`onGoToGastosFijos`, `onGoToSuscripciones`, `onGoToGastos`) passed to ResumenTab

### SQL migration
- `028_households_current_balance_and_pago_extraordinario.sql` added to `sql/`

## IMPORTANT: NOT YET COMMITTED
All changes are staged (modified files) but no commit was created — session ended for compaction. Run these commands after resuming:

```bash
git add lib/cycle.ts app/(app)/finanzas/actions.ts app/(app)/finanzas/page.tsx \
  components/finance/FixedPaymentsTab.tsx components/finance/FinanceTabs.tsx \
  components/finance/ResumenTab.tsx components/finance/SubscriptionsTab.tsx \
  components/finance/PlanAhorroTab.tsx components/finance/ExpensesTab.tsx \
  sql/028_households_current_balance_and_pago_extraordinario.sql
git commit -m "Fix cycle-aware paid/pending logic, data bugs, rename Gastos Fijos, rework Resumen"
git push
```

## Known remaining items (from this session's requirements list)

Items NOT completed this session:
- **Inicio dashboard finanzas card navigation**: already links to `/finanzas` — confirmed fine
- **Presupuestos ↔ Gastos**: wiring was already correct; category now shows on expense rows; no expenses logged this cycle yet (by design — user needs to log some)
- **"Vencidos" KPI click**: `TappableKpi` component renders correctly but no `onClick` was wired for overdueCount chip (low priority — overdueCount should now be 0)
- **Real Debrid `billing_interval_days`**: `billing_cycle="otro"` with correct renewal date; section header now says "Otros ciclos" — sufficient

## Design identity (Índigo Profundo · Dark-first · Two-tier glass)
- **Background:** deep indigo `#0D0B1F` + azulejo SVG tile + depth ellipse
- **Brand accent:** saffron gold `#E8C547` (`--color-terracotta` CSS var)
- **Two-tier glass rule:** blur only on nav bars (`blur(20px)`) and modals/sheets (`blur(24px)`)
- **Text:** `#F0F6FC` primary (`brown` token), `#94A3B8` secondary (`muted` token)
- **Icons:** Phosphor Icons v2 only; SSR path (`/dist/ssr`) for server components
- **Canonical design doc:** `DESIGN.md`

## Production URL
https://home-hub-dun.vercel.app

## Last good committed state
- Commit: `a3d9138` (Add Plan de Ahorro tab with phase allocation and mortgage guidance)
- All current work is uncommitted staged changes

## SQL migrations applied
- 001–027 (full schema + finance cycle + income + subscriptions + category budgets)
- 028 applied directly via Supabase MCP (file saved in sql/)

## Edge Function + pg_cron
- `send-push` v8 deployed; `send-push-cron` (every min) + `document-expiry-scan` (08:00 UTC daily)
