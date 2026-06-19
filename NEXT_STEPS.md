# Next Steps

## Current state
AI assistant is live. Three bugs fixed this session (modal focus, Gemini model deprecation, missing env var). Manual verification is the only remaining task before the AI milestone is complete — blocked on Gemini free-tier daily quota until UTC midnight (≈2am Spain time).

---

## Next session: complete AI verification

**Wait until the day after 2026-06-19** for the Gemini quota to reset, then open https://home-hub-dun.vercel.app and test each prompt below. Wait ~30 seconds between each.

| # | Prompt | Where to check |
|---|--------|---------------|
| 3 | `Add milk and bread to the shopping list` | /compra → leche + pan appear |
| 4 | `Añade un recordatorio para pagar el seguro el 20 de julio` | /recordatorios → seguro appears |
| 5 | `¿Qué tenemos en la lista de la compra?` | AI describes items, no DB changes |
| 6 | `Crea una suscripción de Netflix por 15 euros al mes` | /finanzas → Suscripciones tab |
| 7 | `Añade el recibo del gas, 60 euros, día 5` | /finanzas → Pagos fijos tab |
| 8 | `Apunta un gasto de supermercado de 45 euros de hoy` | /finanzas → Gastos tab |
| 9 | `Añade una tarea para limpiar el baño, semanal` | /tareas → baño appears |
| 11 | Any English prompt | AI response must be in Spanish |

If you see 429 again, the quota hasn't reset yet — wait longer and retry.

---

## After verification is complete

No planned milestones. The app is feature-complete for v1. Possible future work:
- AI: update existing records (requires item ID matching)
- AI: create meal plan entries directly
- Calendar module enhancements
- Offline sync improvements
