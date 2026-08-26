# Home Hub — Handoff Document
Updated: 2026-08-26 (Backend phase B4 — COMPLETE; B1–B2 done earlier same day)

## Current state
**Backend phase B4 (canonical finance) is done** in one combined pass
(migrations 042a/042b/043; repo records `sql/042_canonical_ledger.sql`,
`sql/043_finance_invariants.sql`).

- **Canonical ledger** (`ledger_entries`): one row per ACTUAL recorded movement
  (expenses; payment_instances while 'pagado'; mortgage_payments while 'pagado'
  with amount=cuota+extra and principal split; savings_contributions),
  maintained EXCLUSIVELY by security-definer triggers on the source tables —
  clients are select-only. unique(source_table, source_id) = no double
  counting; edits update the same entry; soft delete/restore propagates.
  Backfill verified (counts + sums match sources exactly).
  `ledger_monthly_totals` view (security_invoker) is the aggregation surface.
  Documented adaptations: income/subscriptions are projections (no real
  movement rows exist in the product) and debts keep a manual balance — none
  produce ledger entries; existing UI reports still read source tables, which
  the triggers keep numerically identical to the ledger by construction.
- **balance_snapshots**: dated history fed by a trigger whenever
  households.current_balance changes (Madrid date).
- **Invariants fixed (real bugs)**: savings_goals.current_amount is now
  trigger-maintained by delta (the action's read-modify-write increment was
  race-prone and deletions never decremented — action updated accordingly);
  mortgages.current_balance now decreases by applied principal+extra when an
  installment is paid and reverses on revert/delete (previously paying never
  moved the balance); interest never reduces the liability.
- **Budget alerts**: scan_budget_threshold_notifications() (daily cron 18:00)
  computes month spending from the ledger, notifies at 80%/100% of
  households.monthly_budget, deduped per household/month/threshold, amount-free
  copy, delivered via the outbox.
Tests: 15 ledger/invariant assertions executed against the live DB (all pass;
record in `supabase/tests/007_ledger.sql`), vitest 37/37, lint 0 errors,
typecheck + build green.

**Earlier same day**: B1.1–B1.3 (hardening, invitations v2, outbox), B2.1–B2.3
(recurrence engine, offline shopping, menu/calendar). See git history.

## NEXT PHASE
B5 (FTS search, unified trash + purge decision, async export), B6 (AI
proposal/confirm), B7 (final hardening), B3 (Google Calendar — needs the
user's Google Cloud console). User actions pending: re-enable push
(Ajustes → Dispositivos); Google Cloud project before B3 goes live.

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
