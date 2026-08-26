# Next Steps

**Backend B2.3 (menú + calendario nativo): COMPLETO.** ✔ Fase B2 entera terminada.

Acciones del usuario pendientes:
- **Reactivar push en vuestros móviles** (Ajustes → Dispositivos).
- **Antes de la fase B3 (Google Calendar)**: crear el proyecto de Google Cloud
  (se pedirán los pasos exactos cuando toque).

Siguientes slices (Fase B4 — finanzas canónicas, en curso):
1. **B4.1 — Ledger canónico + snapshots**: tabla `ledger_entries`, backfill de
   movimientos existentes, FKs únicos desde las tablas fuente, informes sobre
   el ledger.
2. **B4.2 — Ocurrencias unificadas + presupuestos** (rollover idempotente,
   dedupe de umbrales).
3. **B4.3 — Ahorro (sin objetivos) / hipoteca / deudas** (invariantes
   principal-interés, proyección 30 días).
Después: B5 (búsqueda FTS, papelera unificada + decisión de purga, export
asíncrono), B6 (asistente IA con confirmación), B7 (hardening final), B3
(Google Calendar — requiere consola de Google).
