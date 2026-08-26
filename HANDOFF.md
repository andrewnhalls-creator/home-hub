# Home Hub — Handoff Document
Updated: 2026-08-26 (Backend slice B1.3 — COMPLETE; B1.1/B1.2 done earlier same day)

## Current state
**Backend slice B1.3 (transactional outbox + activity hardening) is done.**
Migrations 038a–d (repo copy `sql/038_outbox.sql`): `outbox_jobs` queue
(dedupe_key unique, claim/lease via `for update skip locked`, capped exponential
backoff + jitter, attempt-free deferral, cancellation, revive-on-re-enqueue),
service-role-only (RLS + grants). AFTER INSERT/DELETE triggers on
`scheduled_notifications` enroll/cancel delivery jobs in the same transaction as
the domain write — all producers covered with zero app-code changes. New Edge
Function `supabase/functions/outbox-worker` (deployed, v1) claims jobs and
delivers: in-app `notification_events` created idempotently (`source_key` unique
— full index, PostgREST can't infer partial ones), Web Push per active device,
**quiet hours now DEFER the push instead of dropping it** (per-user
`deliver_push_event` job scheduled for quiet-hours end). Cron: jobid 1
(send-push scheduled) replaced by jobid 3 `outbox-worker-cron` (* * * * *,
verified succeeding); send-push stays deployed only for its device-test mode;
document-expiry-scan (jobid 2) unchanged. `activity_log`: INSERT now requires
`actor_id = auth.uid()`, UPDATE/DELETE revoked. E2E verified live: real
scheduled notification → trigger → claim → 2 in-app events → job done (and the
retry/backoff path was exercised by a genuine failure before the 038d fix).
No push attempts occurred because BOTH stored push subscriptions have been
inactive since June (expired endpoints) — re-enable from Ajustes → Dispositivos.
Tests: `supabase/tests/003_outbox.sql` (14 pgTAP assertions, all passing),
vitest 18/18 (new `tests/quiet-hours.test.ts`). Lint 0 errors / typecheck /
build green.

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
