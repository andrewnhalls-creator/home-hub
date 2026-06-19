# Next Steps

## Immediate: browser validation (Part A)

Deploy to Vercel and verify at https://home-hub-dun.vercel.app:

**Resumen tab (Finanzas)**
- [ ] Saldo en cuenta: 4.386,48 € shown
- [ ] Disponible shows 4.386,48 − pending (≈ 4.364,49 € if only ChatGPT 21,99 € pending)
- [ ] Subtitle reads "Saldo − pendientes"
- [ ] KPI chips tappable → navigate to correct sub-tabs

**Plan de ahorro tab**
- [ ] "Amortizar hipoteca — calculadora" section visible
- [ ] Inputs pre-filled from mortgage (saldo, tipo, cuota)
- [ ] Enter an amount → shows tiempo ahorrado + interés ahorrado
- [ ] Existing savings simulator and reference table still work

**Dashboard (Inicio)**
- [ ] Finanzas tile count shows pending payments only (not "7")
- [ ] "Próximos pagos" list shows only unfulfilled payments
- [ ] Status text reads "próximos pagos" / "Sin próximos pagos"

---

## Part B — Shopping ⇄ Meal-planner toggle (separate session)

When ready, paste the Part B section from `Current Prompt.md` in a fresh session.

Scope:
1. Shared `SegmentedToggle` UI primitive (components/ui/)
2. Toggle at top of Compra and Menú surfaces
3. "Generar lista" promoted to primary gold button on Menu page
4. Reverse link: list → week (with or without schema change — see Current Prompt.md)

---

## Other pending (lower priority)
- Log a test expense → verify Presupuestos category spend shows correctly
- Push notification infrastructure (Supabase Edge Function + pg_cron for due-date scanning)
