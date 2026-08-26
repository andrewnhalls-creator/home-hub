# Home Hub — Handoff Document
Updated: 2026-08-26 (Backend slice B1.1 — COMPLETE)

## Current state
**Backend slice B1.1 (hardening + test harness) is done.** Applied to the live DB as
remote migrations `033a_fk_covering_indexes`, `034_version_updated_by`,
`035_secdef_grants_pgtap` (repo copies in `sql/033–035`): all 66 FK covering indexes;
`version` + `updated_by` on the 8 collision-prone tables maintained by the new
`set_updated_meta` trigger (verified live: version increments, updated_by stamped);
EXECUTE revoked on SECURITY DEFINER functions (anon fully locked out; trigger/cron
functions locked to no client role); pgTAP installed. Test harness: vitest 2 (`npm run
test`, 7 passing tests in `tests/format.test.ts` — vitest 4 doesn't run on Node 21) and
`supabase/tests/001_rls_basic.sql` (pgTAP, run via MCP execute_sql in a rolled-back
transaction — executed clean; outsider sees 0 rows, member sees only their household).
Migration `036_relocate_pg_net` was then user-approved and applied (pg_net →
`extensions`; push cron verified working after). Remaining advisor WARNs are all
documented exceptions (see KNOWN_ISSUES): leaked-password protection (user dashboard
toggle, pending) and 5 intentional authenticated-executable RPC/RLS-helper fns.
Lint 0 errors / typecheck / build / tests all green.

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
**B1.2 (invitations v2: hashed codes + concurrency-safe membership caps)**. Spec:
`Chatgpt_Redesign/HOME_HUB_BACKEND_PROMPT.md`. Supabase project: xzkavpjwvadqldauaabm.
Each slice: migrations + RLS + server logic + UI + Spanish states + tests + build, then
handoff/commit/push/stop. User actions pending: enable leaked-password protection
(Supabase Auth dashboard; may be Pro-plan-gated), Google Cloud OAuth setup (before B3),
papelera purge decision (during B5.2).
