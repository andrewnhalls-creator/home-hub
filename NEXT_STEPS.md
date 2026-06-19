# Next Steps

## Stage 3 — Finanzas page restructure

Restructure the finanzas page so:
- Landing tab = **Resumen** only (KPI overview)
- All sub-sections accessible via a horizontal page slider / tab bar:
  - Ingresos
  - Gastos fijos
  - Suscripciones
  - Gastos variables (rename from "Presupuestos")
  - Gastos
  - Plan de ahorro y hipoteca
  - Deuda (new — uses the `debts` table from Stage 2)

### Key files to touch
- `app/(app)/finanzas/page.tsx` — restructure tab layout
- `components/finance/FinanzasResumen.tsx` (or similar) — new summary landing
- `components/finance/DeudaTab.tsx` — new tab using Debt type + actions from Stage 2

## Stage 4 — Plan de ahorro y hipoteca rework

- Remove phases/objectives structure
- Show: monthly savings amount + projected year total + months left to goal
- Interactive fund-adding with bank account selector
- Mortgage amortisation simulator (manual entry)
