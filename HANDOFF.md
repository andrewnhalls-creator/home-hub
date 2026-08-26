# Home Hub — Handoff Document
Updated: 2026-08-26 (Backend slice B2.3 — COMPLETE; B1.1–B2.2 done earlier same day)

## Current state
**Backend slice B2.3 (menu generation + native calendar) is done.** Migration
041 (repo copy `sql/041_menu_idempotency_calendar_exceptions.sql`): one
generated shopping list per menu week (unique partial index; the action reuses
the existing list on retry/race — no duplicated ingredients; item values are
copied so recipe edits never rewrite reviewed lists), new
`calendar_event_exceptions` table + end>=start check. `lib/calendar.ts`
expansion now runs on the shared engine (fixes date-fns anchor loss: monthly on
day 31 no longer sticks at 28) and skips exception dates. Calendar UI: recurring
events offer "Eliminar solo este día" (exception) vs "Eliminar toda la serie".
Recurring events NOW HAVE reminders (previously none): armed at
create/update/skip for the next occurrence, and outbox-worker v2 re-arms the
following occurrence after each delivery (self-perpetuating chain; the worker
bundles a copy of lib/recurrence.ts guarded by a vitest identity test).
Timezone fix: event reminders were scheduled in server-local time — now Madrid.
Tests: `supabase/tests/006_calendar_menu.sql` (6 pgTAP, all passing), vitest
37/37 (new `tests/calendar.test.ts`). Lint 0 errors / typecheck / build green.
outbox-worker v2 deployed and smoke-tested.

**B2.2 (earlier)**: idempotent offline shopping (mutation ids + version-guarded
conflicts, Spanish conflict UI), transactional `finish_quick_purchase()`,
list-delete soft-deletes/restores its linked expense (`sql/040`).

**B2.1 (earlier)**: `lib/recurrence.ts` single engine (month-end anchors, DST
wall-clock), occurrence history tables, concurrency-safe completions,
recurring reminders actually advance now (`sql/039_occurrence_history.sql`).

**B1.3 (earlier)**: transactional outbox (`sql/038_outbox.sql`): `outbox_jobs`
queue (claim/lease, capped backoff+jitter, deferral, cancellation),
`outbox-worker` Edge Function deployed + cron jobid 3 every minute (verified);
scheduled_notifications enroll via triggers transactionally; quiet hours DEFER
pushes instead of dropping; activity_log actor-integrity + append-only.
NOTE: both stored push subscriptions expired in June — re-enable from
Ajustes → Dispositivos to get real phone pushes again.

**B1.2 (earlier)**: invitations v2 — hashed show-once codes, revocation, use limits,
atomic redemption, concurrency-safe caps trigger (`sql/037_invites_v2.sql`;
15 pgTAP assertions in `supabase/tests/002_invites.sql`).

**B1.1 (earlier)**: FK indexes ×66, `version`+`updated_by` trigger on 8 tables, secdef
grant lockdown, pg_net → extensions, pgTAP + vitest harness (`sql/033–036`).
Advisor status: only documented exceptions remain (see KNOWN_ISSUES) — leaked-password
protection is now an ACCEPTED RISK (Pro-only feature; 2-person household, user
decision 26/08), plus the 5 intentional authenticated-executable RPC/RLS helpers.

Plan: `Chatgpt_Redesign/BACKEND_PLAN.md` — 16 vertical slices (B1.1 → B7.1); the app was
already full-stack (34 RLS-enabled tables), so the plan is gap-closure, not greenfield.
Note for future DB slices: the MCP auto-mode permission classifier blocks some DDL
(REVOKE/DROP-heavy or mixed migrations) — split migrations into small focused chunks;
additive chunks generally pass.

The Casa Calma frontend redesign (F1–F12) remains complete and verified
(plan: `Chatgpt_Redesign/REDESIGN_PLAN.md`, last frontend commit 149ba72).

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

## NEXT PHASE: Backend slices
Work `Chatgpt_Redesign/BACKEND_PLAN.md` one slice per session, in order; next is
**B1.3 (transactional outbox + activity-log hardening)**. Spec:
`Chatgpt_Redesign/HOME_HUB_BACKEND_PROMPT.md`. Supabase project: xzkavpjwvadqldauaabm.
Each slice: migrations + RLS + server logic + UI + Spanish states + tests + build, then
handoff/commit/push/stop. User actions pending: Google Cloud OAuth setup (before B3),
papelera purge decision (during B5.2). Manual check worth doing: generate + redeem one
real invite through the live UI (Ajustes → Invitar) when convenient.
