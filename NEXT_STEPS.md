# Next Steps

**Backend B1.1 (hardening + harness): COMPLETO.** ✔ (migraciones 033–035 aplicadas)

Acciones del usuario pendientes:
- Aprobar/aplicar `sql/036_relocate_pg_net.sql` (drop+recreate de pg_net fuera de
  `public`; el clasificador de permisos bloqueó el DROP — decisión del usuario).
- Activar leaked-password protection en el dashboard de Supabase Auth.

Siguientes slices:
1. **B1.2 — Invitaciones v2**: `code_hash` (HMAC + pepper), revocación/límites de uso,
   redención atómica con topes concurrency-safe (≤5 miembros, ≤4 hogares por usuario),
   tests pgTAP de concurrencia, código visible solo al crearlo.
2. **B1.3 — Outbox transaccional**: tabla `outbox_jobs` (dedupe_key único), worker Edge
   Function con claim/lease (`for update skip locked`) y backoff, activity_log
   append-only, migrar escaneos de notificaciones al patrón outbox.
3. **B2.1 — Motor de recurrencia** (`lib/recurrence.ts` + ocurrencias materializadas de
   recordatorios/tareas con clave única por plantilla+ocurrencia).

Pendiente menor del frontend: iconos PWA con branding antiguo.
