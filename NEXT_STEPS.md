# Next Steps

**Backend B2.2 (compra offline idempotente + compra transaccional): COMPLETO.** ✔
(migración 040, 7 tests pgTAP + 32 vitest)

Comprobaciones/acciones del usuario pendientes:
- **Reactivar push en vuestros móviles** (Ajustes → Dispositivos).
- Prueba en el móvil: modo avión → marcar artículos → volver online → se
  sincronizan sin duplicar; si el otro miembro cambió algo mientras, sale un
  aviso en español y la lista se refresca.

Siguiente slice:
1. **B2.3 — Menú/recetas + calendario nativo**: generación de lista de la
   compra desde el menú idempotente (clave por semana; reintentos sin
   duplicados; editar receta no reescribe artículos ya revisados), calendario
   sobre `lib/recurrence.ts` (recurrencia + excepciones, tz IANA, all-day vs
   instante, soft delete + papelera), realtime tras escritura durable.

Después (Fase B3): Google Calendar — requiere que el usuario cree el proyecto
de Google Cloud (documentaremos los pasos exactos en ese slice).

Pendiente menor del frontend: iconos PWA con branding antiguo.
