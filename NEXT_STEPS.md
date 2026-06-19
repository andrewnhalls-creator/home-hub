# Next Steps

## Immediate: browser validation (Part B)

Deploy to Vercel and verify at https://home-hub-dun.vercel.app:

**Toggle (both surfaces)**
- [ ] Visit `/compra` → "Lista" segment gold/active, "Semana" segment neutral
- [ ] Visit `/menu` → "Semana" segment teal/active, "Lista" segment neutral
- [ ] Clicking "Semana" from Compra navigates to `/menu`
- [ ] Clicking "Lista" from Menú navigates to `/compra`
- [ ] Toggle has no backdrop-filter (content rule)
- [ ] Both segments keyboard-operable, visible focus ring

**Generar lista button (Menú page)**
- [ ] Button renders with gold background (`bg-terracotta text-cream`), not teal border
- [ ] "Recetas" button stays secondary (terracotta border/text)

**Reverse link (list → week)**
- [ ] Go to Menú, click "Generar lista de la compra" for current week
- [ ] Navigate to the new list in Compra → Historial
- [ ] "Ver semana →" link appears top-right in list detail
- [ ] Clicking it navigates to `/menu?start=YYYY-MM-DD` for the correct week
- [ ] Older lists (created before migration) show no "Ver semana →" link

---

## Part A browser validation (still pending)

**Resumen tab (Finanzas)**
- [ ] Saldo en cuenta: 4.386,48 € shown
- [ ] Disponible shows 4.386,48 − pending (≈ 4.364,49 € if only ChatGPT 21,99 € pending)
- [ ] Subtitle reads "Saldo − pendientes"

**Plan de ahorro tab**
- [ ] "Amortizar hipoteca — calculadora" section visible
- [ ] Inputs pre-filled from mortgage (saldo, tipo, cuota)
- [ ] Enter an amount → shows tiempo ahorrado + interés ahorrado

**Dashboard (Inicio)**
- [ ] Finanzas tile count shows pending payments only (not "7")
- [ ] "Próximos pagos" list shows only unfulfilled payments

---

## Other pending (lower priority)
- Log a test expense → verify Presupuestos category spend shows correctly
- Push notification infrastructure (Supabase Edge Function + pg_cron for due-date scanning)
