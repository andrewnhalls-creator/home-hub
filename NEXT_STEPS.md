# Next Steps

**Backend B1.3 (outbox transaccional): COMPLETO.** ✔ (migraciones 038a–d, worker
`outbox-worker` desplegado, cron cambiado y verificado, 14 tests pgTAP + 18 vitest)

Comprobaciones/acciones del usuario pendientes:
- **Reactivar push en vuestros móviles** (Ajustes → Dispositivos): las dos
  suscripciones almacenadas llevan caducadas desde junio, así que ahora mismo los
  avisos solo llegan al centro de notificaciones de la app.
- Probar una invitación real desde la UI (pendiente de B1.2, sigue sin hacerse).

Siguientes slices (Fase B2 — uso diario):
1. **B2.1 — Motor de recurrencia**: `lib/recurrence.ts` con suite vitest (años
   bisiestos, día 29/30/31 → último día válido, DST Europe/Madrid) + ocurrencias
   materializadas de recordatorios/tareas con clave única plantilla+ocurrencia.
2. **B2.2 — Compra offline idempotente**: mutationId UUID + baseVersion, semántica
   de conflicto en español, FK explícita trip→expense, reconciliación realtime.
3. **B2.3 — Menú/recetas + calendario nativo**: generación de lista idempotente,
   recurrencia + excepciones en calendario, tz IANA, soft delete.

Pendiente menor del frontend: iconos PWA con branding antiguo.
