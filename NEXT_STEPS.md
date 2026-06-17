# Next Steps

## Deploying future changes

GitHub-triggered deploys are blocked on the Hobby plan (collaborator restriction).
Always deploy manually via CLI:

```
cd /Users/dianezhalls/Projects/home-hub && npx vercel --prod
```

Make sure `npx vercel whoami` shows `andrewnhalls-2415` before deploying.

---

## Milestone UI-9: Apple Home Glass visual refresh, navigation, Papelera cleanup — COMPLETE ✓

Completed 2026-06-17. See HANDOFF.md for full detail.

---

## Next: Milestone FIN-9 — Mortgage tracking inside Finance

**Do not start until UI-9 is confirmed deployed and working.**

### Goal
Add a dedicated Hipoteca section inside Finanzas to track mortgage payments and balance.

The Hipoteca tab placeholder already exists in FinanceTabs (UI-9 work).
FIN-9 wires it up with real data.

### What FIN-9 must include

**UI (Spanish labels):**
- Hipoteca / Resumen de hipoteca
- Saldo pendiente / Importe inicial
- Cuota mensual / Próximo pago / Fecha de pago
- Pagado este mes / Capital amortizado / Intereses
- Años restantes / Pagos realizados
- Historial de pagos / Añadir pago de hipoteca
- Actualizar saldo / Banco / Tipo de interés
- Fecha de inicio / Fecha estimada de finalización

**Database migrations (write SQL to sql/ first, review before applying):**

`mortgages` table:
- id, household_id, name, lender
- original_principal, current_balance, monthly_payment
- interest_rate, start_date, end_date, payment_day
- currency (default EUR), status, notes
- created_by, created_at, updated_at
- archived_at, archived_by, deleted_at, deleted_by

`mortgage_payments` table:
- id, household_id, mortgage_id
- due_date, paid_date, amount
- principal_amount, interest_amount, extra_payment
- status, paid_by, notes, created_by, created_at, updated_at

**RLS:** both tables need household-scoped RLS using `is_household_member(household_id)`.

**Finance dashboard summary (eventually):**
- Mortgage remaining balance
- Monthly mortgage payment
- Next payment date
- Progress bar (paid vs remaining)
- Link to Hipoteca detail

### FIN-9 rules
- Ask before applying any database migration
- No destructive changes
- Manual entry only (no bank integration)
- Soft delete with deleted_at/deleted_by
- Do not duplicate payment counting across fixed_payments and mortgages

---

## Post-launch ideas (not milestones)

- Global search `/buscar` page — design-ready, deferred post-MVP
- Web font upgrade (Inter or Plus Jakarta Sans)
- Animated page transitions
- More granular push notification scheduling
- Dedicated `/papelera` route for all modules (currently each module has its own collapsed section)
