# Next Steps

## Current state
Finance module major update complete (migrations 025–027, data seeded, all tabs shipped). Build green, pushed to origin main.

---

---

## Final validation — run this when all planned changes are done

Open https://home-hub-dun.vercel.app → Finanzas

**Resumen tab**
- [ ] Cycle label shows "25 may – 25 jun" in the tab header (not "Junio 2026")
- [ ] Balance card shows income ≈ 4.223 €

**Ingresos tab**
- [ ] Andrew — Nómina 1.600 € día 25, Pensión 1.033 € día 25, Pensión quincenal 145 € (≈290 €/mes)
- [ ] Jose — 1.300 € día 28
- [ ] Total mensual shown ≈ 4.223 €

**Suscripciones tab**
- [ ] Monthly subs show paid/pending chips: Podimo ✅ Pagado, Apple ✅ Pagado, Claude ✅ Pagado, HBO ✅ Pagado, Netflix ✅ Pagado, Outlook ✅ Pagado, ChatGPT ❌ Pendiente (día 21)
- [ ] Google One shows "Disponible desde oct 2026" badge (inactive, no chip)
- [ ] Real Debrid shows "Próxima renovación: 08/11/2026" with no paid/pending chip
- [ ] APP Carrefour does not appear

**Presupuestos tab**
- [ ] 6 categories shown: Alimentación 500 €, Ocio 200 €, Veterinario 100 €, Perros 100 €, Cuidado personal 50 €, Farmacia 20 € (total 970 €)
- [ ] Progress bars render (green when under budget, amber near limit, red over)

**Plan de ahorro tab**
- [ ] Fase 1 shown as active (ago–dic 2026): Emergencia 600 €, Compras 300 €, Amortización 500 €, Sin asignar 73,56 €
- [ ] Emergency fund progress bar has a 3M milestone marker at the halfway point
- [ ] "Próxima fase — Fase 2" preview card visible below
- [ ] Mortgage prepayment collapsible opens and closes correctly

---

## Possible next sessions (in priority order)

1. **AI assistant verification** — Gemini quota may have reset. Run the browser test checklist from HANDOFF.md (tests 3–9 + 11).
2. **Push notification infrastructure** — Supabase Edge Function + pg_cron for due-date scanning and Web Push delivery (core v1 feature).
3. **Subscription edit flow** — currently only add + delete; add an edit modal (same as IncomeSource pattern) so billing_day etc. can be updated from the UI without SQL.
4. **Mortgage tab data** — fill in the real mortgage details via the UI (lender, start date, end date, payment day).
5. **Mobile UX polish** — responsive check on all new tabs at 375px width.
