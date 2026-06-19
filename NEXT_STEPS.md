# Next Steps

## Current state
Finance module major update complete (migrations 025–027, data seeded, all tabs shipped). Build green, pushed to origin main.

---

## Validation checklist (manual, as of 19 June 2026)

Open https://home-hub-dun.vercel.app → Finanzas

- [ ] **Cycle label** shows "25 may – 25 jun" in the tab header (not "Junio 2026")
- [ ] **Ingresos tab**: Andrew — Nómina 1.600 € día 25, Pensión 1.033 € día 25, Pensión quincenal 145 € (≈290 €/mes). Jose — 1.300 € día 28. Total ≈ 4.223 €/mes
- [ ] **Suscripciones tab** — mensuales show chips: Podimo ✓ Pagado, Apple ✓ Pagado, Movistar ✓ Pagado (4,99 €), DIGI ✓ Pagado, ChatGPT ✗ Pendiente, Claude ✓ Pagado, HBO ✓ Pagado, Netflix ✓ Pagado, Outlook ✓ Pagado
- [ ] Google One shows "Disponible desde oct 2026" badge (inactive)
- [ ] Real Debrid shows "Próxima renovación: 08/11/2026" (no paid/pending chip)
- [ ] APP Carrefour does not appear
- [ ] **Presupuestos tab** shows 6 categories: Alimentación 500 €, Ocio 200 €, Veterinario 100 €, Perros 100 €, Cuidado personal 50 €, Farmacia 20 €
- [ ] **Plan de ahorro tab** shows Fase 1 active (ago–dic 2026): Emergencia 600 €, Compras 300 €, Amortización 500 €
- [ ] Emergency fund progress bar has 3M milestone marker
- [ ] Mortgage guidance collapsible block opens/closes correctly
- [ ] **Resumen balance card** shows income ≈ 4.223 €

---

## Possible next sessions (in priority order)

1. **AI assistant verification** — Gemini quota may have reset. Run the browser test checklist from HANDOFF.md (tests 3–9 + 11).
2. **Push notification infrastructure** — Supabase Edge Function + pg_cron for due-date scanning and Web Push delivery (core v1 feature).
3. **Subscription edit flow** — currently only add + delete; add an edit modal (same as IncomeSource pattern) so billing_day etc. can be updated from the UI without SQL.
4. **Mortgage tab data** — fill in the real mortgage details via the UI (lender, start date, end date, payment day).
5. **Mobile UX polish** — responsive check on all new tabs at 375px width.
