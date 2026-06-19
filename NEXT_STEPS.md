# Next Steps

## Immediate: browser validation (Stage 1)

Deploy to Vercel and verify at https://home-hub-dun.vercel.app:

**1a — KPI cards (Inicio)**
- [ ] Mark a fixed payment as paid in Finanzas → navigate to Inicio → "Próximos pagos" count reflects the change without a manual refresh
- [ ] Skip a payment → same check
- [ ] Add/delete a subscription → Inicio KPI updates

**1b — Shopping list live updates**
- [ ] On the compra page, add an item via the quick-add bar → item appears immediately without page refresh
- [ ] Complete an item → it moves to the completed section immediately
- [ ] Open the page on two devices → change on one appears on the other within ~1 s

**1c — AI button no longer blurry**
- [ ] Add a shopping item → a success toast appears → AI chat FAB (gold button, bottom-right) remains crisp with no blur artefact
- [ ] Toast text is still readable against the dark background (border + colour is enough contrast)

---

## Stage 2 — Finance data model: editable, reclassifiable, bank account, debt

Per Current Prompt.md — start only after Stage 1 browser validation is confirmed.

2a. Every Ingreso, Gasto fijo, Suscripción, Gasto variable and Ahorro entry must be fully EDITABLE (amount, category/type, including moving between fijo/variable).

2b. Add "bank account" field (ING / BBVA / Revolut enum) to Ingresos, Gastos (fijos and variables), Suscripciones, Ahorro — create/edit forms + display on items.

2c. Add "Deuda" (Debt) schema: name, balance, monthly payment, payment schedule. Soft-delete rules apply. UI page can follow in Stage 3.

---

## Stage 3 — Finanzas IA restructure (Resumen + menu + sub-pages)
## Stage 4 — Plan de ahorro y hipoteca rework

(See Current Prompt.md for full spec of Stages 3 and 4.)
