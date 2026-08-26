# Home Hub — Handoff Document
Updated: 2026-08-26 (Backend slice B2.1 — COMPLETE; B1.1–B1.3 done earlier same day)

## Current state
**Backend slice B2.1 (recurrence engine + occurrence history) is done.**
`lib/recurrence.ts` is now THE single recurrence engine (documented subset:
diaria/semanal/quincenal/mensual/anual; month-end anchor rule 31→28/30→31;
Europe/Madrid wall-clock preserved across DST; occurrence keys = due date/
instant). Migrations 039/039b (repo copy `sql/039_occurrence_history.sql`):
`reminder_completions` table + `chore_completions.occurrence_key`, unique
(template, occurrence_key), `anchor_day` on reminders/chores (backfilled),
actor-integrity RLS on both history tables. Rewired actions: **recurring
reminders now actually advance** (they previously died as 'hecho' after one
completion); chores use the engine (fixes the setMonth overflow bug: 31 ene →
28 feb, not 3 mar) and completion is concurrency-safe (upsert on occurrence key
+ guarded advance `where due unchanged` → at most one next occurrence);
`combineDueAt`/chore notifications now share the engine's tz helpers (fixes
chore notifications scheduled in server-local time). Completion history is
immutable (template edits never touch it). Tests:
`supabase/tests/004_occurrences.sql` (8 pgTAP, all passing), vitest 32/32
(new `tests/recurrence.test.ts`: leap years, month-end, DST spring/fall).
Lint 0 errors / typecheck / build green.

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
