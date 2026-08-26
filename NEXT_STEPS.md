# Next Steps

**Backend fase 0 (plan): COMPLETO.** ✔ Plan en `Chatgpt_Redesign/BACKEND_PLAN.md`.

1. **B1.1 — Hardening + harness**: mover `pg_net` de `public`, revocar EXECUTE anon en
   funciones SECURITY DEFINER, índices FK (66), columnas `version`/`updated_by`,
   instalar pgTAP + vitest con primeros tests RLS. Usuario: activar leaked-password
   protection en el dashboard de Supabase Auth.
2. **B1.2 — Invitaciones v2**: códigos hasheados, revocación/límites, redención atómica
   con topes (5 miembros / 4 hogares) concurrency-safe + tests pgTAP.
3. **B1.3 — Outbox transaccional**: tabla `outbox_jobs`, worker Edge Function con
   claim/lease y backoff, migrar escaneos de notificaciones al patrón outbox.

Pendientes menores del frontend (HANDOFF.md): iconos PWA con branding antiguo.
