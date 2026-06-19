# Next Steps

## Current state
AI assistant milestone complete (all 3 sections). Pending: manual browser verification before moving on.

---

## AI Assistant — manual verification checklist

All code is live on Vercel. Run these tests in the browser:

1. Open the app → a gold sparkle button should appear bottom-right on every screen
2. Tap it → "Asistente del hogar" modal opens with greeting text
3. **English input:** "Add milk and bread to the shopping list" → items appear in Spanish on /compra after close
4. **Spanish input:** "Añade un recordatorio para pagar el seguro el 20 de julio" → reminder created on /recordatorios
5. **Read-only:** "¿Qué tenemos en la lista de la compra?" → AI describes the list, no DB changes
6. **Finance — subscription:** "Crea una suscripción de Netflix por 15 euros al mes" → appears in /finanzas suscripciones
7. **Finance — fixed payment:** "Añade el recibo del gas, 60 euros, día 5" → appears in /finanzas pagos fijos
8. **Finance — expense:** "Apunta un gasto de supermercado de 45 euros de hoy" → appears in /finanzas gastos
9. **Chore:** "Añade una tarea para limpiar el baño, semanal" → appears on /tareas
10. **API key check:** Open browser DevTools → Network tab → look at `/api/ai` request — key must NOT appear in request/response body
11. Confirm all created record names are in Spanish even when prompted in English

---

## What's next after verification

No planned milestones. The app is feature-complete for v1. Possible future work:
- Calendar module enhancements
- AI: update existing records (requires item ID matching)
- AI: create meal plan entries directly
- Offline sync improvements
