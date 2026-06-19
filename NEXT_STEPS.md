# Next Steps

## Current state
All tasks complete. App is deployed and fully up to date at https://home-hub-dun.vercel.app

---

## Completed this session (2026-06-19)

- ✅ **iPad Pro layout** — AppShell container widened to `lg:max-w-5xl`; finanzas gets a 192px sidebar tab nav on lg+; ResumenTab KPI chips go `lg:grid-cols-6`; menu week list goes `lg:grid-cols-2`; calendario trash wrapper `max-w` constraint removed
- ✅ **Chore snooze** — Clock button on ChoreCard opens "Posponer tarea" modal: Mañana / En 3 días / Próxima semana / Reprogramar (mirrors ReminderCard exactly; bumps `next_due_date` and reschedules push notification)
- ✅ **Inline trash sections removed** — recordatorios, calendario, documentos, compra/listas no longer show an inline papelera. Deleted items just disappear. `/papelera` (already in Más nav) handles restore if needed.
- ✅ **Offline shopping queue** — already fully built (`useOfflineToggleQueue` hook, localStorage queue, flush on reconnect) — verified, no work needed

---

## Known remaining gaps (if you want to go further)

- `/buscar` global search — explicitly post-MVP, route stub exists but not built
- File upload for documents — post-MVP (URL-only in v1)
- Finanzas inline trash sections (`<details>` accordion) — still present but collapsed by default; could be removed to match the other modules
