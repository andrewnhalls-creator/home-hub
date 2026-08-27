# Home Hub — Handoff Document
Updated: 2026-08-27 (Cycle-aware income/gastos + getCycleDueDate fix)

## Current state
**27/08 (later): finance sums are now fully cycle-aware.**
- New helpers in `lib/cycle.ts` (tested, `tests/cycle.test.ts`): `occursInCycle`
  and `expectedIncomeInCycle`. Rule: the 25→25 cycle is named after its END
  month, and anything charged/received on day >= 25 of month M belongs to cycle
  M+1 (pay arrives the 26th and funds the FOLLOWING month).
- Resumen "Entradas" no longer averages (no anual/12): it sums only income that
  actually arrives this cycle; quincenal counts ×2. Annual subscriptions count
  in Salidas only in the cycle their renewal falls (renewal_date/start_date).
  "Este mes" header now shows the cycle's end month. Ingresos tab leads with
  "Entra este mes" + honest annual estimate.
- Fixed `getCycleDueDate`: it produced dates OUTSIDE the cycle when today was
  in the 25th→end-of-month window, which (a) mis-stated pagado/pendiente and
  (b) broke instance dedup — 138 duplicate out-of-cycle `payment_instances`
  created 25–27 Aug were deleted from the live DB.
- Data: the two nóminas + both pagas extra set to `payment_day = 26` (user:
  "we get paid on the 26th"). `IncomeFrequency` type now includes `semestral`.
- Gates: lint 0 errors, typecheck, vitest 53/53 (16 new cycle tests), build.

**Earlier 27/08: household finance data imported + connected account balances.**
- Initial financial data imported (idempotent server-side operation via MCP —
  values never in repo files): 10 subscriptions, 15 active fixed payments
  (frequency + recurrence months, "Fecha pendiente" where unknown), 2 car-loan
  debts (balances honestly "por confirmar"), mortgage completed from the real
  ING amortization schedule (265.000 €, 2,90 % fijo, 14/07/2026–01/08/2056,
  cuota 1.103,01), 10 income sources with expected amounts. Zero paid
  occurrences / zero ledger entries created. IBI + Seguro de hogar moved from
  subscriptions to fixed payments; old "Coche" fixed payment replaced by the
  Arteon debt (originals deactivated with notes).
- NEW connected accounts system (sql/047, sql/048): 4 account labels
  (BBVA Andrew, ING — Cuenta conjunta, Revolut, BBVA José) everywhere; Cuentas
  card on Resumen with editable "saldo a fecha" anchor; income "Recibido"
  button (actual amount per month, creates the ledger income movement);
  gastos/pagos/hipoteca/ahorro subtract per account through the ledger.
  Verified live: 1000 − 42,37 + 305,50 → edit → all resums correctly.
- Fixed-payment monthly totals and occurrence generation are now
  frequency-aware (annual/semestral count only in their listed months).

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
1. Re-enable push on both phones (Ajustes → Dispositivos) — subscriptions
   expired in June; notifications currently reach the in-app centre only.
   (User said they will.)
2. PWA icons still old branding (mechanical, pending).

## Product decisions (user, 26/08/2026 — do not revisit without asking)
- Ahorro: KEEP the no-targets model (May rework). Do NOT reintroduce goal targets/% from
  the `ahorro_y_objetivos` mockup.
- Navigation: no "Casa" hub page — Inicio covers it; bottom nav stays
  Inicio · Compra · + · Finanzas · Calendario.
- Actividad "Nueva Nota" / notes feature: DROPPED permanently.
- Papelera (decided 26/08/2026): manual owner-only "Vaciar" button with
  confirmation (migration 046); NO 30-day auto-purge.
- Google Calendar sync (B3): DROPPED by user decision 26/08/2026 — the couple
  does not want it. Do not build without a new explicit request.

## Known follow-ups
- PWA icons (`public/icons/`) still old dark branding — regenerate (pending, mechanical).
- Screens verified with empty data (recetas cards/detail, documentos, deseos, F4 hero cards)
  should be re-checked once real data exists.
- DESIGN_SYSTEM.md deprecated; DESIGN.md is current. UI_REDESIGN_PLAN.md is from the old
  indigo redesign (historical).
