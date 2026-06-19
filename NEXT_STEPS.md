# Next Steps

## Stage 4 — Plan de ahorro y hipoteca rework

The "Plan de ahorro y hipoteca" sub-page currently stacks SavingsTab + PlanAhorroTab + MortgageTab. Stage 4 consolidates and reworks this entire section:

### 4a — Consolidate savings pages
Make PlanAhorroTab the ONLY savings page. Absorb SavingsTab (goals list) into it or remove it. No separate goals tab.

### 4b — Remove fases/phases and objectives
- Remove "fases"/phases concept entirely from PlanAhorroTab
- Do NOT show target amounts/goals per plan
- For each plan show: monthly amount + projected total by end of current calendar year (monthly × months remaining) + months left

### 4c — Specific plan values to fix
- Fondo de emergencia: 400 €/month
- Amortización de hipoteca: 700 €/month (currently shows "sin objetivo" — fix)
- Rename "Fondo compra casa" → "Inmobiliario"

### 4d — Interactive fund-adding
- Tapping a plan opens an "Añadir fondos" flow
- Also a dedicated "Añadir fondos" button on each plan card
- Fund-adding lets user pick bank account (ING / BBVA / Revolut) per Stage 2

### 4e — Mortgage amortisation simulator
- For a given extra/lump payment amount, show: months shortened + interest saved
- Planner maths only — no financial advice copy
- Wired to the mortgage data from MortgageTab

### Key files
- `components/finance/PlanAhorroTab.tsx` — major rework
- `components/finance/MortgageTab.tsx` — integrate simulator, may stay separate or merge
- `components/finance/SavingsTab.tsx` — will be removed or absorbed
- `app/(app)/finanzas/actions.ts` — may need new actions for fund contributions with bank_account
