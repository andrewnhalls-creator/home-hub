# Home Hub — Backend Implementation Plan (fase 0 output)

Date: 2026-08-26 · Source spec: `Chatgpt_Redesign/HOME_HUB_BACKEND_PROMPT.md` (read in full)
Supabase project: `xzkavpjwvadqldauaabm`

> **How to use this plan:** one slice ≈ one session. Each slice is a vertical cut:
> migrations + constraints + RLS + server logic + UI wiring + Spanish states + tests +
> lint/typecheck/build, committed and pushed before stopping (CLAUDE.md context protocol).
> Do not start slice N+1 while slice N has known data-integrity, authorization or build
> failures.

---

## 0. Audit result — what is real vs. simulated

**Key finding: the backend prompt assumes a simulated Stitch frontend, but this repo is
already a working full-stack app.** Every module screen reads/writes live Supabase data
through server components + per-route server actions (`app/(app)/<módulo>/actions.ts`)
using the anon key + RLS. Web Push works end-to-end (VAPID, `send-push` Edge Function,
pg_cron every minute). The plan below is therefore a **gap-closure plan**, not greenfield.

Current DB state: 32 applied migrations (`sql/001`–`032`), 34 tables in `public`, RLS
enabled on all, `is_household_member` / `is_household_owner` helpers, multi-household
support (up to 4 per user), activity log, notification pipeline
(`notification_events`, `scheduled_notifications`, `notification_delivery_attempts`,
`push_subscriptions`).

### Genuinely simulated / missing vs. the spec

| Area | Current state | Spec requirement |
|---|---|---|
| Google Calendar | Nothing exists (no tables, no OAuth) | Full dedicated-calendar two-way sync (Phase 3) |
| Canonical ledger | No `ledger_entries`. `expenses`, `payment_instances`, `subscriptions`, `mortgage_payments` are aggregated separately; `finishQuickPurchase` inserts an `expenses` row with **no FK link** to the trip | One canonical entry per real movement, explicit FK provenance, no double counting |
| Invitations | `household_invites.code` stored **plaintext**, single-use, expiry only | Keyed hash only, rotation, revocation, use limits, concurrency-safe caps |
| Outbox | None. Bespoke `scheduled_notifications` + cron scans | Transactional outbox with claim/lease, capped backoff, idempotency keys |
| Offline shopping | `useOfflineToggleQueue` = localStorage last-write queue; no idempotency keys, no versions, no conflict semantics | UUID idempotency keys, authoritative versions, Spanish conflict/refresh UI |
| AI assistant | Real (provider router + `executeAssistantAction`) but **stateless**: `autoExecute` path writes without stored proposal; no `pending_ai_actions`, no confirm-time revalidation | Proposal stored server-side, explicit confirmation, revalidation, idempotent execution |
| Search | Server-side `ILIKE %q%` per table | FTS/trigram, Spanish + accent-insensitive (unaccent/pg_trgm available, not installed) |
| Trash | Real but hand-wired per type (7 types); no calendar events; no purge | Registry-based allow-list, per-type dependency checks, purge (policy: user decision pending) |
| Export | Synchronous route `app/api/ajustes/exportar` (JSON), no owner gate, no CSV, no signed expiring file | Owner-authorized async job, JSON+CSV, signed expiring storage, retention |
| Optimistic concurrency | None (`updated_at` trigger only) | `version` int or `updated_at` compare on collision-prone edits |
| Balance snapshots | Single `households.current_balance` column (migration 028) | Dated snapshot history + projection anchored to snapshot time |
| Recurrence | Ad-hoc per module (`payment_instances` materialized; reminders/chores logic in app code + cron scans) | One documented engine: tz-aware, month-end rule, DST-tested, idempotent occurrence keys |
| Tests | **No test infrastructure at all** (no test script, no runner) | pgTAP/RLS tests, unit/integration, E2E smoke |

### Supabase advisor findings (to fix in B1.1 / B7.1)

- Security (WARN): `pg_net` installed in `public` schema; SECURITY DEFINER functions
  executable by `anon` (`scan_document_expiry_notifications`, `switch_household`) and
  broadly by `authenticated` (`create_household`, `redeem_household_invite`, helpers);
  Auth leaked-password protection disabled.
- Performance (INFO): 66 unindexed foreign keys, 5 unused indexes.

---

## 1. Fixed product decisions (do not revisit without asking)

Carried from HANDOFF.md (26/08/2026) and CLAUDE.md — they **override** the backend
prompt where they conflict:

1. **Ahorro keeps the no-targets model.** The spec's "savings goals" slices adapt:
   goals are purposes + contribution log, no target amounts/percentages.
2. **No "Casa" hub page**; bottom nav stays Inicio · Compra · + · Finanzas · Calendario.
3. **Notes feature ("Nueva Nota") dropped permanently** — no notes tables/actions.
4. **Papelera purge policy deferred** — decide "Vaciar" + 30-day auto-purge with the
   user during slice B5.2, not before.
5. No bank integrations ever; finance is manual-entry; `bank_account` (migration 030)
   is a text label only — matches the spec's `household_accounts` concept.
6. Spanish (es-ES) UI, `Europe/Madrid`, EUR, Monday weeks, soft deletes per CLAUDE.md.
7. Vercel hosting only; all scheduled work in Supabase Edge Functions + pg_cron.

---

## 2. Target schema map

### Existing tables — keep, upgrade in the phase noted

| Table | Upgrade |
|---|---|
| `profiles`, `households`, `household_members` | B1.2 concurrency-safe caps (5 members, 4 households); B1.1 `updated_by` where missing |
| `household_invites` | B1.2 rebuild: `code_hash` (keyed digest), drop plaintext, `revoked_at`, `max_uses`, `use_count`, audit events |
| `categories` | keep (archive semantics exist, migration 015) |
| `shopping_lists`, `shopping_trips`, `shopping_items` | B2.2 `version`, idempotency; B4.1 ledger link |
| `recipes`, `recipe_ingredients`, `meal_plans` | B2.3 idempotent list generation keys |
| `reminders`, `chores`, `chore_completions` | B2.1 shared recurrence engine + materialized occurrences w/ unique occurrence keys |
| `calendar_events` | B2.3 recurrence subset + exceptions, tz column, all-day `date` vs timed `timestamptz` split, soft delete |
| `fixed_payments`, `payment_instances` | B4.2 ledger links, expected-vs-actual kept historical |
| `expenses` | B4.1 becomes source table linked 1:1 to `ledger_entries` |
| `income_sources` | B4.2 materialized `income_occurrences` + ledger links |
| `subscriptions` | B4.2 materialized occurrences + ledger links, monthly/annual equivalents |
| `savings_goals`, `savings_contributions` | B4.3 contributions → ledger (savings-allocation type, excluded from spending analytics); **no targets** |
| `mortgages`, `mortgage_payments` | B4.3 principal/interest invariants, ledger links, balance history |
| `debts` | B4.3 payments/interest split, ledger links |
| `category_budgets` + monthly budget | B4.2 idempotent rollover materialization, threshold dedupe keys |
| `household_documents` | B5.2 registry trash; expiry pipeline kept |
| `wishlist_items` (+votes) | keep (unique vote constraint exists, migration 020 — verify in B5.2) |
| `activity_log` | B1.3 append-only enforcement (revoke client UPDATE/DELETE), FK indexes |
| notification tables | B1.3 migrate scans onto outbox pattern gradually; B5.1 quiet hours/prefs audit |

### New tables

| Table | Phase | Purpose |
|---|---|---|
| `outbox_jobs` | B1.3 | `id`, `household_id`, `job_type`, `dedupe_key` (unique), `payload jsonb`, `status`, `attempts`, `next_attempt_at`, `claimed_at/by`, `last_error`, timestamps |
| `reminder_occurrences` / chore occurrence upgrade | B2.1 | unique `(template_id, occurrence_key)`; completion actor+time preserved |
| `calendar_event_exceptions` | B2.3 | per-series skip/override rows |
| `integrations.google_calendar_connections` | B3.1 | **private schema**, encrypted refresh token (pgcrypto + Edge secret key), scopes, status, calendar id/tz, last sync/error |
| `integrations.google_calendar_sync_cursors` | B3.2 | next sync token, full-sync state |
| `integrations.google_calendar_channels` | B3.3 | channel/resource ids, hashed verification token, expiration |
| `public.google_calendar_event_links` | B3.2 | event ↔ Google event id, etag, origin, versions, payload hash; unique both directions |
| `public.google_calendar_conflicts` | B3.3 | local/remote snapshots (no secrets), resolution status |
| `ledger_entries` | B4.1 | household, occurred_at, `amount numeric(14,2) >= 0`, `entry_type` enum (income, expense, grocery, fixed_payment, subscription, savings_contribution, mortgage_payment, debt_payment, adjustment), account label, category, description, status, soft delete; source tables carry `ledger_entry_id` FK unique |
| `balance_snapshots` | B4.1 | dated spendable-balance snapshots (replaces single column; keep column as view/latest) |
| `export_jobs` | B5.2 | owner-only async export, storage path, signed-URL expiry, retention |
| `pending_ai_actions` | B6.1 | user, household, action payload + normalized hash, schema version, expires_at, status |

`integrations` schema is **not** exposed through the Data API; only Edge Functions /
service-role server code touch it. A safe status view/RPC surfaces sync state to owners.

---

## 3. Module map

### Current (keep the pattern)

- `app/(app)/<módulo>/page.tsx` — server components fetch via `lib/supabase/server` + RLS.
- `app/(app)/<módulo>/actions.ts` — server actions per module (all mutations).
- `app/api/` — `ai`, `assistant`, `assistant/execute`, `ajustes/exportar`.
- `lib/` — `auth.ts` (`requireHousehold`), `types.ts`, `validations/*` (Zod),
  `activity.ts`, `notifications.ts`, `calendar.ts`, `format.ts`, `constants.ts`.
- `lib/ai/` — `provider-router.ts`, `action-schema.ts`, `execute-assistant-action.ts`.
- `hooks/` — `useOfflineToggleQueue`, `useOnlineStatus`, `usePushSubscription`.
- `components/RealtimeSync.tsx` — household channel.
- `supabase/functions/send-push` — delivery worker (pg_cron `* * * * *`).

### Planned additions

- `lib/server/<module>.ts` — extract a typed domain service **only when a second caller
  appears** (AI confirm path, outbox workers, export job) so UI actions, assistant and
  workers share one code path. No big-bang repository rewrite.
- `lib/recurrence.ts` — the single documented recurrence engine (freq, interval,
  weekdays, month-day, end/count; `Europe/Madrid` wall-clock; day-31 → last valid day;
  DST-tested) used by reminders, chores, calendar, payments, income, subscriptions.
- `supabase/functions/outbox-worker` — claim/lease loop, capped backoff + jitter.
- `supabase/functions/google-oauth-callback`, `google-sync`, `google-webhook` (B3).
- `supabase/functions/export-job` (B5.2).
- `sql/0NN_*.sql` — forward-only, numbered, applied via Supabase MCP after review.
- `supabase/tests/*.sql` — pgTAP RLS/constraint tests; `tests/*` — vitest unit tests.

### Test tooling (introduced in B1.1, grown per slice)

- **pgTAP** (extension available, not yet installed) via `supabase test db`-style SQL
  tests for RLS positive/negative, caps, unique/idempotency constraints.
- **vitest** for pure logic (recurrence engine, finance math on integers/decimal.js-free
  numeric strings, AI schema validation).
- **Playwright smoke** added in B7.1 (login → add item → finish purchase → see expense).
- Every slice ends: `npm run lint && npm run typecheck && npm run build` + its tests.

---

## 4. Delivery slices

### Phase B1 — Secure foundation

**B1.1 Hardening + conventions + test harness** *(next session)*
- Migration: move `pg_net` out of `public`; revoke `anon`/unneeded `authenticated`
  EXECUTE on SECURITY DEFINER functions (`scan_document_expiry_notifications`,
  `switch_household`, helpers stay callable by `authenticated` only where required);
  add the 66 missing FK indexes (drop the 5 unused ones); add `updated_by` and
  `version integer not null default 1` to collision-prone tables (shopping_items,
  calendar_events, reminders, chores, recipes, fixed_payments, expenses, subscriptions).
- Dashboard (document, user does): enable leaked-password protection.
- Install pgTAP; first RLS test file (cross-household negative test proving a guessed
  UUID reads nothing); add vitest + `npm run test` script.
- No UI change. Done when advisors show no WARN except documented exceptions.

**B1.2 Invitations v2 + membership caps**
- Migration: `code_hash` (HMAC via pgcrypto + server pepper in Edge secret), drop
  plaintext `code`, add `revoked_at`, `max_uses`, `use_count`; rewrite
  `redeem_household_invite` as atomic: auth → hash lookup → expiry/revocation/limit →
  existing-membership → `household_members` capacity (≤5) and user households (≤4)
  under `select … for update` of the membership sets → insert + activity row.
- pgTAP: concurrent redemption cannot exceed caps; direct insert into
  `household_members` beyond cap rejected (constraint trigger).
- UI: Ajustes invite flow shows code **once** at creation; Spanish errors non-enumerating.

**B1.3 Transactional outbox + activity hardening**
- Migration: `outbox_jobs` (+ unique `dedupe_key`), append-only `activity_log`
  (revoke UPDATE/DELETE from client roles).
- `supabase/functions/outbox-worker` + pg_cron: atomic claim (`for update skip locked`),
  capped exponential backoff + jitter, terminal-failure state, replay-safe.
- Move document-expiry and scheduled-notification scans to enqueue through the outbox
  (delivery dedupe key per recipient/event/occurrence — spec requirement).
- vitest: backoff math; pgTAP: dedupe uniqueness, claim exclusivity.

### Phase B2 — Everyday household use

**B2.1 Recurrence engine + reminders/chores occurrences**
- `lib/recurrence.ts` with vitest suite: leap years, day 29/30/31 → last valid day,
  `Europe/Madrid` spring-forward/autumn-back, end-date/count.
- Migration: materialized occurrences for reminders (and chores as occurrence rows),
  unique `(template_id, occurrence_key)`; template edits affect only future uncompleted
  occurrences from an effective date; completing a recurring chore creates at most one
  next occurrence (unique constraint makes retries idempotent).
- Rewire reminders/chores actions + due-notification generation to occurrences.
- UI states already exist; verify Spanish copy on edit-future vs edit-all flows.

**B2.2 Shopping: idempotent offline mutations + conflict semantics**
- Migration: `version` on `shopping_items` (from B1.1), `applied_mutations` dedupe
  table or idempotency-key column; explicit FK `shopping_trips.expense_id` (interim
  provenance until B4.1 ledger).
- Server action `toggleShoppingItemComplete` accepts `{ itemId, completed, mutationId,
  baseVersion }` → idempotent replay returns current state; divergent edit returns
  conflict payload for Spanish refresh UI.
- Rework `useOfflineToggleQueue`: UUID `mutationId` per queued change; realtime
  reconcile must not double-toggle (compare versions).
- `finishQuickPurchase`/trip completion: reopening/editing/deleting updates or reverses
  the **same** linked expense transactionally (single RPC).
- pgTAP + vitest; manual offline test on mobile viewport.

**B2.3 Menu/recipes generation + native calendar upgrade**
- Idempotent "generar lista de la semana": generation key per (menu week → list);
  retry adds no duplicates; recipe edits never rewrite already-reviewed items
  (items copy name/quantity, keep nullable origin refs).
- Calendar migration: recurrence subset + `calendar_event_exceptions`, IANA tz column,
  all-day as `date` / timed as `timestamptz` (split columns), end ≥ start checks,
  soft delete + papelera registration (B5.2 registry will absorb it), event reminder
  timing → occurrences via outbox.
- Realtime publication for calendar changes (after durable write).

### Phase B3 — Google Calendar (privacy-safe dedicated calendar)

**B3.1 OAuth + encrypted connection + calendar creation**
- Document Google Cloud setup (project, Calendar API, consent screen, redirect URIs,
  scope `calendar.app.created` preferred) — user console actions listed, never faked.
- `integrations` private schema + `google_calendar_connections`; refresh token encrypted
  (pgcrypto, key in Edge Function secrets); owner-only connect/disconnect RPCs that
  re-verify ownership server-side.
- OAuth code flow with high-entropy `state` (+PKCE), offline access, callback validates
  user still owns the household; create `Home Hub — {nombre}` secondary calendar.
- Honest "no conectado" state in Ajustes until real credentials exist.

**B3.2 Event links + initial full sync + outbound propagation**
- `google_calendar_event_links` (unique both directions) + `sync_cursors`.
- Paginated full sync; `nextSyncToken` persisted only after last page.
- Home Hub → Google via outbox jobs (create/patch/delete, partial `patch`, extended
  private properties carry event id/household id/schema marker; never secrets).
- Feedback-loop guard: origin + last-synced version/hash so our own writes don't echo.

**B3.3 Webhooks + incremental sync + conflicts**
- `google_calendar_channels`; webhook Edge Function validates channel/resource/token,
  enqueues incremental sync only, responds fast.
- Incremental sync worker: pagination, transactional application, `410 Gone` → full
  resync; Google deletes soft-delete the mapped event; channel renewal job with overlap;
  periodic jittered reconciliation as backstop.
- `google_calendar_conflicts` + Spanish resolution flow (Home Hub / Google / merged),
  audited idempotent resolution RPC.

**B3.4 Disconnect + fake-adapter test suite**
- Disconnect: stop channels, revoke/destroy token ciphertext, mark links disconnected,
  keep Home Hub data and the Google calendar; idempotent reconnect/resync.
- Fake Google adapter covering the spec's test list (state mismatch, revoked token,
  duplicate/out-of-order/missing webhooks, DST-crossing events, rate limits, owner
  transfer with active connection) + written staging-account checklist.

### Phase B4 — Canonical finance

**B4.1 Ledger + backfill + snapshots**
- Migration: `ledger_entries` + `entry_type` enum + `balance_snapshots`; add unique
  `ledger_entry_id` FKs to `expenses`, `payment_instances`, `shopping_trips` (replacing
  the interim expense link), `mortgage_payments`, `savings_contributions`, debt payments.
- Backfill script (reviewed, run via MCP in a transaction): one entry per existing paid
  movement; verify counts + monthly totals match current Finanzas UI before/after.
- Rewire reports (Este mes, movimientos, analytics) to aggregate the ledger; savings
  contributions excluded from spending analytics; mortgage/debt principal never counted
  as category spending; no client-computed authoritative totals.
- pgTAP: one-movement-one-entry invariants; vitest: treatment rules.

**B4.2 Occurrences unification + budgets**
- Income/subscription occurrences materialized via the recurrence engine; paid
  occurrence + ledger entry transition atomically (RPC); template edits never rewrite
  past occurrences.
- Gasto rápido: user-confirmed category suggestions computed only from the household's
  own past expense descriptions (simple server-side match, no external data).
- Budget rollover materialized once per category/month (unique constraint, idempotent);
  threshold notifications dedupe key per budget/threshold/month through the outbox.
- 30-day cash-flow projection = latest snapshot + recorded movements after it +
  eligible forecast occurrences, snapshot time displayed.

**B4.3 Savings / mortgage / debts invariants**
- Savings (no targets): progress = sum of active contributions; monthly plan purposes
  planned-vs-actual; contributions are ledger `savings_contribution` entries.
- Mortgage/debts: current balance = opening − applied principal + explicit adjustments
  (never reduced by interest); extra payments; balance history; soft-delete reverses
  ledger links without destroying audit history; restore reactivates the same link.
- Finance calculation test pack: edits, deletion, restore, month boundaries.

### Phase B5 — Platform features

**B5.1 Search + notification preferences audit**
- Install `unaccent` + `pg_trgm`; generated tsvector (spanish config) or trigram
  indexes per searched table; replace ILIKE queries in `app/(app)/buscar` with indexed,
  household-scoped, accent-insensitive search returning grouped typed results.
- Quiet hours: defer (not drop) eligible notifications; category prefs verified against
  spec; expired/invalid push subscriptions marked inactive (verify current behaviour).

**B5.2 Unified trash registry + async export**
- Trash registry: allow-listed entity types (module, table, label builder, restore fn,
  dependency checks) — no client-supplied identifiers; add calendar events + remaining
  soft-deleted types to papelera.
- **Ask the user here:** purge policy ("Vaciar" + 30-day auto-purge) — deferred decision.
  Implement whatever is decided as owner-only privileged op + activity record.
- Export v2: owner-only, async `export_jobs` via outbox worker, JSON + CSV, file in
  Storage with signed expiring URL, documented retention; excludes secrets/tokens/push
  key material.

### Phase B6 — AI assistant hardening

**B6.1 Proposal/confirmation lifecycle**
- `pending_ai_actions` (user, household, payload + normalized hash, schema version,
  short expiry); remove the `autoExecute` silent-write path — **every** write shows a
  proposal card and requires explicit confirmation.
- Confirm RPC revalidates auth, membership, payload against Zod allow-list, referenced
  record versions and expiry, then calls the same domain services as the UI
  (`lib/server/*`), idempotently, with activity logging.
- Prompt-injection defenses: household text treated as data; no system prompt/secret
  leakage; clarification instead of invented amounts/dates/members.
- Initial allow-list stays: add shopping item, create reminder, record one-off expense.
- Tests: tampering, expiry, stale-version conflict, replay.

### Phase B7 — Hardening and release readiness

**B7.1 Security/perf/a11y/regression + runbooks**
- Re-run advisors → clean; rate-limit auth-adjacent endpoints, invite redemption, AI,
  export, OAuth callback; CSP + secure headers compatible with Supabase + Google OAuth;
  redaction review of logs/errors.
- Playwright smoke pack (login, compra E2E, gasto rápido, calendario, papelera restore).
- Performance/index pass with real query shapes; realtime/offline reconciliation review.
- Runbooks: env-var inventory (names only), Supabase/Vercel/Google console checklists,
  backup/recovery, account/household deletion path; final regression + build.

---

## 5. Cross-cutting rules for every slice

- Migrations: forward-only files in `sql/`, reviewed, applied via Supabase MCP; never
  destructive without prior explanation (CLAUDE.md).
- RLS tested **before** UI wiring; helper functions keep fixed `search_path`, least
  privilege, no recursion; privileged RPCs re-verify membership internally.
- Money: `numeric(14,2)`, positive amounts + explicit type, no float math in JS for
  authoritative values (server/SQL computes).
- Idempotency: every job/mutation that can retry carries a unique key.
- Realtime only after durable writes; reconnect refetch is authoritative.
- Service-role key + integration secrets: Edge Function secrets only, never client,
  never logged, never in handoff docs.
- Spanish states (loading/empty/error/conflict/offline/permission) on every touched
  screen; `es-ES`, EUR, dd/MM/yyyy, Monday weeks.
- End of slice: `npm run lint`, `npm run typecheck`, `npm run test` (once it exists),
  pgTAP suite, `npm run build`, update HANDOFF/NEXT_STEPS/KNOWN_ISSUES, commit, push,
  stop.

## 6. External actions the user must perform (documented, never faked)

- Enable leaked-password protection (Supabase Auth dashboard) — B1.1.
- Google Cloud: project, Calendar API, OAuth consent + redirect URIs, client ids for
  dev/prod — before B3.1 can go live (code ships against fake adapter otherwise).
- Confirm AI provider key(s) remain configured server-side — B6.1.
- Papelera purge policy decision — during B5.2.
