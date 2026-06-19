# Next Steps

## Current state
AI assistant is live and confirmed working (key valid, model `gemini-2.0-flash` responds). Two bugs fixed this session. Manual verification of each AI action scenario is the only remaining task before the milestone is complete.

---

## AI assistant — remaining manual verification (next session priority)

Open https://home-hub-dun.vercel.app in your browser. Log in, then test each prompt below. **Wait ~30 seconds between each** to stay under the Gemini free-tier rate limit.

Already confirmed ✅: FAB visible, modal opens with greeting, no API key leak.

| # | Action | Prompt to send | Where to verify |
|---|--------|---------------|----------------|
| 3 | Shopping (English) | `Add milk and bread to the shopping list` | /compra → "leche" + "pan" appear |
| 4 | Reminder | `Añade un recordatorio para pagar el seguro el 20 de julio` | /recordatorios → "seguro" appears |
| 5 | Read-only | `¿Qué tenemos en la lista de la compra?` | AI describes list items, no DB changes |
| 6 | Subscription | `Crea una suscripción de Netflix por 15 euros al mes` | /finanzas → Suscripciones tab |
| 7 | Fixed payment | `Añade el recibo del gas, 60 euros, día 5` | /finanzas → Pagos fijos tab |
| 8 | Expense | `Apunta un gasto de supermercado de 45 euros de hoy` | /finanzas → Gastos tab |
| 9 | Chore | `Añade una tarea para limpiar el baño, semanal` | /tareas → "baño" appears |
| 10 | Security | Open DevTools → Network → `/api/ai` response body | Key must NOT appear |
| 11 | Spanish | Check that all AI responses are in Spanish | Even for English prompts |

Also fix locally: open `.env.local`, remove the `❯ ` prefix from the `GEMINI_API_KEY=` line.

---

## After verification is complete

No planned milestones. The app is feature-complete for v1. Possible future work:
- AI: update existing records (requires item ID matching)
- AI: create meal plan entries directly
- Calendar module enhancements
- Offline sync improvements
