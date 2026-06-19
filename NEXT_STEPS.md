# Next Steps

## IMMEDIATE: Commit the uncommitted work

All code changes from the last session are staged but not committed. Start the next session by running:

```bash
git add lib/cycle.ts app/(app)/finanzas/actions.ts app/(app)/finanzas/page.tsx \
  components/finance/FixedPaymentsTab.tsx components/finance/FinanceTabs.tsx \
  components/finance/ResumenTab.tsx components/finance/SubscriptionsTab.tsx \
  components/finance/PlanAhorroTab.tsx components/finance/ExpensesTab.tsx \
  sql/028_households_current_balance_and_pago_extraordinario.sql
git commit -m "Fix cycle-aware paid/pending logic, data bugs, rename Gastos Fijos, rework Resumen"
git push
```

Then deploy to Vercel and verify:

**Gastos Fijos tab**
- [ ] Coche (día 1) → ✅ Pagado
- [ ] DIGI (día 28) → ✅ Pagado
- [ ] Gasolina (día 1) → ✅ Pagado
- [ ] Luz (día 3) → ✅ Pagado
- [ ] Movistar (día 29, 4,99 €) → ✅ Pagado
- [ ] Alquiler julio (925 €) → ⏳ Pendiente (under "Pago extraordinario")
- [ ] Tasa de basuras (53,20 €) → ⏳ Pendiente (under "Pago extraordinario")
- [ ] "Pagado este ciclo" + "Pendiente" summary card shows correct totals

**Resumen tab**
- [ ] Saldo en cuenta: 4.386,48 € shown
- [ ] Disponible this cycle calculated correctly
- [ ] KPI chips tappable → navigate to correct sub-tabs
- [ ] Gastos fijos split row: ~498 € pagado, ~978 € pendiente (Alquiler + Tasa)
- [ ] "Vencidos": 0
- [ ] "Próximos": includes ChatGPT (día 21, 2 days away)

**Suscripciones tab**
- [ ] Seguro de hogar renewal: 01/07/2026
- [ ] IBI: 159,15 €/año
- [ ] Annual total: 663,98 €
- [ ] "Otros ciclos" section header (not "Trimestrales")
- [ ] ChatGPT → ⏳ Pendiente (día 21)

**Hipoteca card on Resumen**
- [ ] "Próximo pago" shows 01/08/2026

**Plan de ahorro tab**
- [ ] Savings simulator visible at bottom
- [ ] Entering a monthly contribution → shows months/date to reach target
- [ ] Entering a target date → shows required monthly amount
- [ ] Mortgage reference table (collapsible) shows correctly

---

## Possible next sessions (in priority order)

1. **Browser validation** — open https://home-hub-dun.vercel.app/finanzas and verify all items above
2. **Log test expense** — log 1 expense with "Alimentación" category → verify Presupuestos shows spend > 0
3. **Push notification infrastructure** — Supabase Edge Function + pg_cron for due-date scanning and Web Push delivery (core v1 feature)
4. **Subscription edit flow** — currently only add + delete; add edit modal so billing_day etc. can be updated without SQL
5. **Account balance edit UI** — add a way to update `households.current_balance` from the Resumen tab without SQL
