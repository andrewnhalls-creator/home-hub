# Next Steps

**Backend B1.2 (invitaciones v2): COMPLETO.** ✔ (migraciones 037a–d aplicadas,
15 tests pgTAP en verde)

Comprobación manual pendiente (rápida): generar y canjear una invitación real desde
la UI (Ajustes → Invitar) cuando os venga bien.

Siguientes slices:
1. **B1.3 — Outbox transaccional**: tabla `outbox_jobs` (dedupe_key único), worker Edge
   Function con claim/lease (`for update skip locked`) y backoff con jitter,
   activity_log append-only (revocar UPDATE/DELETE a clientes), migrar los escaneos de
   notificaciones al patrón outbox.
2. **B2.1 — Motor de recurrencia**: `lib/recurrence.ts` con suite vitest (años
   bisiestos, día 29/30/31, DST Europe/Madrid) + ocurrencias materializadas de
   recordatorios/tareas con clave única por plantilla+ocurrencia.
3. **B2.2 — Compra offline idempotente**: mutationId UUID + baseVersion, semántica de
   conflicto en español, FK explícita trip→expense.

Pendiente menor del frontend: iconos PWA con branding antiguo.
