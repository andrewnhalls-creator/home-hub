# Home Hub — Handoff Document
Updated: 2026-08-26 (Backend fase 0 — PLAN COMPLETE)

## Current state
**Backend fase 0 (plan-only) is done.** `Chatgpt_Redesign/BACKEND_PLAN.md` contains the
full audit + implementation plan: 16 vertical slices (B1.1 → B7.1) mapped to the backend
prompt's delivery phases. **Key audit finding:** the app is already a working full-stack
app (34 RLS-enabled tables, 32 migrations, live push pipeline) — the plan is gap-closure,
not greenfield. Main gaps: Google Calendar (nothing exists), canonical `ledger_entries`,
hashed invites, transactional outbox, offline idempotency/conflicts, AI proposal/confirm
lifecycle, FTS search, registry-based trash, async export, zero test infrastructure.
Advisors flagged: `pg_net` in public, anon-executable SECURITY DEFINER fns, leaked-password
protection off, 66 unindexed FKs — all scheduled in B1.1/B7.1.

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
Work `Chatgpt_Redesign/BACKEND_PLAN.md` one slice per session, in order, starting with
**B1.1 (hardening + FK indexes + version columns + pgTAP/vitest harness)**. Spec:
`Chatgpt_Redesign/HOME_HUB_BACKEND_PROMPT.md`. Supabase project: xzkavpjwvadqldauaabm.
Each slice: migrations + RLS + server logic + UI + Spanish states + tests + build, then
handoff/commit/push/stop. User console actions pending: leaked-password protection
(B1.1), Google Cloud OAuth setup (before B3), papelera purge decision (during B5.2).
