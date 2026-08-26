# Next Steps

**Backend B2.1 (motor de recurrencia + historial de ocurrencias): COMPLETO.** ✔
(migraciones 039/039b, `lib/recurrence.ts`, 8 tests pgTAP + 32 vitest)

Comprobaciones/acciones del usuario pendientes:
- **Reactivar push en vuestros móviles** (Ajustes → Dispositivos): suscripciones
  caducadas desde junio; los avisos llegan solo al centro de la app.
- Prueba rápida en la app: marcar como hecho un recordatorio/tarea recurrente y
  ver que salta a la siguiente fecha (los mensuales del día 31 ahora caen en el
  último día válido del mes).

Siguientes slices (Fase B2):
1. **B2.2 — Compra offline idempotente**: mutationId UUID + baseVersion en
   toggleShoppingItemComplete, semántica de conflicto en español, FK explícita
   trip→expense (reversión transaccional al reabrir/editar), reconciliación
   realtime sin dobles toggles.
2. **B2.3 — Menú/recetas + calendario nativo**: generación de lista de la
   compra idempotente (clave por semana), recurrencia + excepciones del
   calendario sobre `lib/recurrence.ts`, separación all-day/instante, soft
   delete + papelera.

Pendiente menor del frontend: iconos PWA con branding antiguo.
