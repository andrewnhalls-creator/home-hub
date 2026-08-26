# Home Hub — Handoff Document
Updated: 2026-08-26 (Backend slice B1.2 — COMPLETE; B1.1 done earlier same day)

## Current state
**Backend slice B1.2 (invitations v2) is done.** Applied as four remote migrations
(037a–d, consolidated repo copy `sql/037_invites_v2.sql`): invite codes are now
16-char/80-bit, generated server-side by `create_household_invite` (owner-only RPC),
stored **only as SHA-256 digests** (plaintext column dropped), shown exactly once in
the UI; rotation on regeneration, explicit `revoke_household_invite`, expiry +
max_uses/use_count limits, activity events. `redeem_household_invite` v2 is atomic and
concurrency-safe (invite→household→profile row locks) and a constraint trigger
(`household_members_caps`) enforces ≤5 members/household and ≤4 households/user even
against direct inserts. UI: InviteSection shows the code once with a "no volverá a
mostrarse" warning + revoke button; onboarding surfaces specific Spanish errors.
Tests: `supabase/tests/002_invites.sql` — **15 pgTAP assertions, all passing** (run via
MCP execute_sql in a rolled-back transaction with fake auth.users). Lint 0 errors /
typecheck / vitest 7/7 / build all green.

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
