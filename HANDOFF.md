# Home Hub — Handoff Document
Updated: 2026-08-26 (Backend phases B1, B2, B4, B5, B6, B7 — COMPLETE; B3 pending user)

## Current state
**The backend build is complete except Google Calendar (B3).** All work from
`Chatgpt_Redesign/BACKEND_PLAN.md` is done and pushed; per-phase details live
in git history and the `sql/033–045` migration records. `OPERATIONS.md` is the
runbook (env inventory, cron jobs, outbox health, backups, documented
deviations). Summary of what exists now:
- B1: security hardening, hashed show-once invitations with concurrency-safe
  caps, transactional outbox + outbox-worker Edge Function (quiet hours defer,
  retries/backoff/lease), append-only activity log.
- B2: shared recurrence engine (DST/month-end correct), occurrence history,
  idempotent offline shopping with Spanish conflict UI, transactional quick
  purchase, idempotent menu→list generation, calendar exceptions
  ("solo este día") + recurring-event reminders (self-re-arming chain).
- B4: canonical trigger-maintained ledger + balance snapshots; fixed real
  bugs (savings drift, mortgage balance never moving); budget 80/100% alerts.
- B5: accent-insensitive indexed search RPC; papelera now includes calendar
  events; export fixed (was silently broken: wrong column names), owner-only,
  JSON + ledger CSV.
- B6: AI assistant proposal/confirm lifecycle (server-stored proposals,
  15-min expiry, atomic idempotent confirm; silent-execute path removed).
- B7: CSP + security headers, per-user rate limits on AI/export, advisors
  clean except documented exceptions (see KNOWN_ISSUES + OPERATIONS.md).
Gates at completion: lint 0 errors, typecheck, vitest 37/37, build — all green.
pgTAP suites 001–007 all passing against the live DB (rolled-back).

## OPEN ITEMS (need the user)
1. **Google Calendar (B3)**: needs a Google Cloud project (Calendar API,
   OAuth consent, client id/secret, redirect URIs). Ask before starting.
2. **Papelera purge policy**: "Vaciar" button and/or 30-day auto-purge —
   deferred decision, papelera is restore-only today.
3. Re-enable push on both phones (Ajustes → Dispositivos) — subscriptions
   expired in June; notifications currently reach the in-app centre only.
4. PWA icons still old branding (mechanical, pending).

## Product decisions (user, 26/08/2026 — do not revisit without asking)
- Ahorro: KEEP the no-targets model (May rework). Do NOT reintroduce goal targets/% from
  the `ahorro_y_objetivos` mockup.
- Navigation: no "Casa" hub page — Inicio covers it; bottom nav stays
  Inicio · Compra · + · Finanzas · Calendario.
- Actividad "Nueva Nota" / notes feature: DROPPED permanently.
- Papelera purge policy ("Vaciar" + 30-day auto-delete): DEFERRED — decide when the
  backend trash phase is built.

## Known follow-ups
- PWA icons (`public/icons/`) still old dark branding — regenerate (pending, mechanical).
- Screens verified with empty data (recetas cards/detail, documentos, deseos, F4 hero cards)
  should be re-checked once real data exists.
- DESIGN_SYSTEM.md deprecated; DESIGN.md is current. UI_REDESIGN_PLAN.md is from the old
  indigo redesign (historical).
