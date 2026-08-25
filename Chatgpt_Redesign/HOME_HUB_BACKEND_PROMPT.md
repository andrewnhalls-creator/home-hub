# Home Hub — backend and production-integration build prompt

Use this prompt with the existing Home Hub front end generated from the Stitch prompt pack. The repository’s current UI, routes, responsive layouts, Spanish copy and design system are the starting point. Build the production backend and connect every real interface to it; do not replace the accepted visual design unless a small change is required for correctness, accessibility or a missing state.

This is a complete specification, but it is **not** a request to implement everything as one shallow pass. Work through the delivery phases in order and finish each vertical slice—schema, constraints, RLS, server logic, UI integration, realtime behaviour, background processing and tests—before continuing.

---

## Objective

Turn the existing Home Hub front end into a secure, production-oriented private household application using Supabase as its backend.

Home Hub is an invite-only shared household-management app for a couple, family or small group of housemates. It covers shopping, menus, recipes, reminders, chores, a shared calendar, Google Calendar sync, household finances, documents, wishes, search, notifications, trash, activity history, export and a confirmation-based AI assistant.

It is not a public or multi-tenant SaaS product. A household has one owner and at most four additional members. One user may belong to at most four households. All household data is scoped to the active household and shared with its members unless a requirement explicitly says it is private to one user.

## Non-negotiable product decisions

- User-facing text is natural Spanish from Spain. Code identifiers, types, database objects and file names are English.
- Locale is `es-ES`, currency is EUR, dates display as `dd/MM/yyyy`, time uses `HH:mm`, and weeks start on Monday.
- Use `Europe/Madrid` as the initial household timezone. Store instants in UTC and store the relevant IANA timezone alongside rules whose future interpretation depends on local time.
- All finance entry is manual. Never add Open Banking, bank credential storage, transaction import, financial-product recommendations or financial/tax/legal advice.
- “Account” means only a user-created organisational label. Never store bank account numbers, authentication details or provider connections.
- All meaningful records are editable after creation. Historical occurrences remain historically accurate when a recurring template changes.
- Every destructive action requires confirmation. Records listed as recoverable use soft deletion and appear in the trash.
- Realtime improves collaboration but never replaces database constraints, authorization or durable writes.
- No production feature may depend on fake data, a client-only mock, a placeholder control or a simulated successful request.

## Google Calendar product decision for v1

Implement a privacy-safe dedicated-calendar model:

- Each household may connect **one app-created Google calendar** for optional two-way synchronization.
- Only the household owner may connect, reconnect, pause, resync or disconnect it.
- The connecting owner grants access with their Google account. Home Hub creates a secondary calendar named `Home Hub — {household name}` and stores its Google calendar ID.
- Do not read or import the owner’s primary calendar or any other personal calendar.
- Do not manage Google Calendar ACLs or sharing permissions. Members who want the calendar in Google may be invited through Google Calendar’s own sharing interface.
- Home Hub events and events created directly inside the dedicated Google calendar synchronize in both directions.
- Disconnecting Google stops future synchronization but does not delete either Home Hub events or the Google calendar. Offer a separate, explicit unlink-and-delete-Google-calendar operation only if the API and granted scope allow it, with strong confirmation.
- Home Hub remains fully usable without Google Calendar.

Do not silently broaden this model to personal calendar import, multiple connected Google calendars or per-member private overlays. Those are future features requiring a separate privacy and conflict model.

---

## Technology and architecture

Use the versions already established in the repository unless they are unsupported or insecure. Do not churn dependencies unnecessarily.

- Next.js App Router, React and TypeScript.
- Tailwind CSS and the existing Stitch-generated component/design-token system.
- Supabase Postgres, Auth, Row Level Security, Realtime, Edge Functions and Storage only where explicitly needed.
- `@supabase/supabase-js` and `@supabase/ssr`, with cookie-based SSR authentication.
- Zod, `react-hook-form` and `@hookform/resolvers`.
- `date-fns` with the Spanish locale.
- Vercel hosts the Next.js application. Do not use Vercel Cron.
- Supabase Edge Functions and Supabase Cron/`pg_cron` perform scheduled scans, recurring-occurrence generation, notification delivery, Google Calendar synchronization and retry processing.
- Use a provider-neutral server-side adapter for the AI assistant. No AI provider key may reach the browser.

### Boundary rules

- Browser code uses the Supabase anon key and the authenticated user session only.
- The Supabase service-role key is server-only and used only by narrowly scoped Edge Functions or trusted server code.
- Never solve an RLS problem by exposing service-role access to the client.
- Prefer ordinary user-scoped database access so RLS applies naturally. If a privileged server operation is required, re-authorize the caller explicitly inside that operation.
- Put OAuth tokens, webhook-channel secrets and other integration secrets in a private schema that is not exposed through the Data API. No client policy may read it.
- Keep domain logic out of React components. Use typed repositories/services and small server operations so the backend can be tested independently.

---

## Implementation contract

Before editing code:

1. Inspect the whole repository, package configuration, routes, components, existing data types, tests and environment setup.
2. Identify which Stitch interactions are currently simulated and map them to real backend operations.
3. Produce a short implementation plan and a proposed schema/module map.
4. Preserve unrelated code and user changes.

For every delivery phase:

1. Add versioned, forward-only Supabase migrations.
2. Add primary keys, foreign keys, uniqueness constraints, check constraints, indexes and transactional invariants.
3. Add and test RLS before connecting the UI.
4. Implement typed server/data access and validation.
5. Connect the existing interface and remove the corresponding mock behaviour.
6. Implement loading, empty, error, offline, conflict, permission and retry states in Spanish.
7. Add realtime only after durable writes and authorization work correctly.
8. Add unit, integration, RLS and end-to-end coverage proportionate to risk.
9. Run formatting, linting, type-checking, tests and a production build.
10. Update setup, architecture, data-model and operations documentation.

Do not continue to the next phase while the current one has known data-integrity, authorization or build failures. Do not claim a feature is complete merely because its table or interface exists.

If an external credential or console action is unavailable, implement and test everything possible with an adapter or local stub, document the exact remaining setup, and leave the product in an honest “not connected” state. Never fabricate a successful connection.

---

## Data conventions

Apply these conventions consistently:

- Use UUID primary keys generated by Postgres.
- Every household-owned record has a non-null `household_id` foreign key.
- Mutable tables have `created_at`, `created_by`, `updated_at` and `updated_by` where meaningful.
- Use a safe trigger to maintain `updated_at`; do not trust client timestamps.
- Store money as `numeric(14,2)` with explicit non-negative checks where appropriate. Never use JavaScript floating-point arithmetic for authoritative financial calculations.
- Store instants as `timestamptz` in UTC. Store all-day dates as `date`, not midnight timestamps.
- Store recurrence timezones as IANA timezone names.
- Use explicit enums or constrained text for stable status/type fields. Make enum migrations evolvable.
- Use optimistic concurrency for collision-prone edits, such as an integer `version` or comparison against `updated_at`.
- Client-created offline-capable mutations carry a UUID idempotency key.
- Derived totals are calculated from canonical source records or transactionally maintained projections. Do not let clients submit authoritative totals.
- Index foreign keys, common household/date filters, due-state scans, soft-delete predicates and search vectors.
- Do not use unbounded polymorphic relations for data whose referential integrity matters. Prefer explicit foreign keys or a carefully constrained association table.

### Soft deletion

Use `deleted_at` and `deleted_by` for recoverable records. Ordinary queries exclude deleted records. Restore clears both fields after revalidating dependencies and authorization. Permanent deletion is owner-only where sensitive and must be implemented as a privileged operation with explicit confirmation and an activity record.

Soft-delete at minimum:

- Income sources and occurrences
- Fixed-payment templates and occurrences
- Expenses and canonical ledger movements
- Budgets and allocations
- Savings goals, plans and contributions
- Mortgages, mortgage occurrences and extra payments
- Debts and payments
- Subscriptions and occurrences
- Documents
- Calendar events and series
- Reminders and occurrences
- Shopping trips and completed spend history

Recipes, shopping items, chores and wishes may use hard deletion only if the accepted UI clearly confirms it and no accounting/audit dependency exists. Prefer soft deletion whenever an activity, recurrence or finance link would otherwise break.

---

## Authentication, profiles and households

Use Supabase email/password authentication:

- Sign up, sign in, sign out, forgot/reset password, change password and change email.
- Create one `profiles` row for each Auth user through a safe server-controlled trigger or idempotent bootstrap operation.
- Do not copy passwords or authentication secrets into public tables.
- Prevent open account enumeration in recovery and invitation responses.

Household model:

- `households`: name, owner, timezone, locale, currency and lifecycle timestamps.
- `household_members`: household, user, role (`owner` or `member`), status, joined date and member preferences.
- Exactly one active owner per active household.
- Maximum five active members per household.
- Maximum four active household memberships per user.
- Ownership transfer is transactional. A household cannot be left without an owner.
- Removing a member immediately revokes household access through RLS. Their historical authorship remains visible as a retained display snapshot or safely resolved profile reference.

Enforce both membership limits in the database inside concurrency-safe transactions; UI checks are only guidance. Lock the relevant household/user membership set or use an equivalent serialization strategy so simultaneous invite redemption cannot exceed a limit.

### Invitations

- Generate cryptographically random invite codes with sufficient entropy.
- Store only a keyed hash/digest, never the redeemable plaintext code.
- Support expiration, rotation, revocation, optional use limits and audit events.
- Redeeming a code is an atomic server operation that checks authentication, expiration, revocation, existing membership, household capacity and the user’s four-household limit.
- Return non-sensitive Spanish error messages without revealing private household information before successful redemption.

### Active household

Store the active-household preference per user, but treat it only as navigation state. Every request still authorizes the actual `household_id`. Never infer access solely from a client cookie or selected-household value.

---

## Row Level Security and authorization

Enable RLS on every table reachable through the Supabase Data API. Nothing is publicly readable.

Create shared helpers such as:

- `is_household_member(target_household_id uuid)`
- `is_household_owner(target_household_id uuid)`
- `current_household_role(target_household_id uuid)` if genuinely useful

Security requirements for helper functions:

- Use the least privilege possible.
- If `security definer` is required, set a fixed safe `search_path`, schema-qualify references, revoke unintended execution rights and avoid accepting identifiers that can escape authorization.
- Do not create recursive RLS policies.
- Do not rely only on RLS: privileged RPCs and Edge Functions must explicitly verify membership/ownership before acting.

Default permissions:

- Active household members may read and collaborate on ordinary household modules, including finance.
- Owner-only: invite management, member removal, ownership transfer, household deletion, Google Calendar connection management and other household-wide external integrations.
- A user may manage only their own profile, personal notification preferences and device subscriptions.
- OAuth tokens and integration internals are never client-readable, including by the household owner.
- Append-only audit rows are insertable only through trusted operations and are not mutable through the client.

Add RLS tests proving at least:

- Members can access their household and cannot access another household by guessed UUID.
- A removed member loses access immediately.
- Owner-only operations reject ordinary members.
- Membership limits cannot be bypassed with direct inserts or concurrent invite redemption.
- Service operations cannot be repurposed to act on a household not authorized for the caller.

---

## Activity log and transactional outbox

Create an append-only activity log for meaningful changes. Store household, actor, action, entity type, entity ID, timestamp and a minimal privacy-safe structured summary. Do not copy full sensitive records or OAuth data into audit payloads.

Record activity transactionally for finance changes, payments, savings, documents, reminders, chores, calendar events, Google sync state changes, shopping spend, notification settings, member management, restore and permanent deletion.

Use a transactional outbox for asynchronous side effects:

- A successful domain transaction writes its outbox job in the same database transaction.
- Workers claim jobs safely, support retries with capped exponential backoff and record terminal failure.
- Every job has an idempotency/deduplication key.
- Replaying a job must not create duplicate notifications, ledger entries, recurring occurrences or Google events.
- Expose operational status for admins/developers without exposing secrets to household members.

---

## Everyday household modules

Implement each module with complete CRUD, ownership metadata, activity records, validation and relevant realtime publication.

### Shopping

- Weekly shopping trips/lists, Monday-based week, status and optional actual trip total.
- Items with name, optional quantity/note, category, ordering, completed state, completer and completion timestamp.
- Household-manageable shopping categories with archive semantics.
- Menu-generated items retain a safe reference to their recipe/ingredient origin where useful but remain independently editable.
- Completing a trip with an actual total creates or updates exactly one canonical grocery-spend ledger entry.
- Reopening, editing, restoring or deleting the trip updates/reverses that same ledger link transactionally.

Limited offline support applies only to the active shopping list:

- The client caches the last-loaded list and queues completion mutations with UUID idempotency keys.
- The backend accepts idempotent mutations and returns authoritative record version/state.
- Define conflict semantics. An already-applied identical completion succeeds idempotently; a true divergent edit returns enough information for a Spanish conflict/refresh UI.
- Realtime updates and reconnect replay must not double-toggle an item.

### Weekly menu and recipes

- Menu weeks start Monday and contain lunch/dinner slots for each day.
- Slots reference either a recipe or free text.
- Recipes include servings, ordered ingredients with quantities/units, ordered steps and household tags/categories.
- Generating a shopping list is a reviewed, idempotent server operation; retrying it must not duplicate ingredients.
- Editing a recipe does not silently rewrite already-reviewed historical shopping items.

### Reminders

- Reminder templates and materialized occurrences support one-off and a documented subset of daily/weekly/monthly/yearly recurrence.
- Assignment may target one active member or the whole household.
- Completion history records actor and time.
- Due notifications are generated from occurrences, not repeatedly inferred from a mutable template.

### Chores

- One-off and recurring templates, assignment, due date, status and occurrence history.
- Completing a recurring chore must be concurrency-safe and create at most one next occurrence.
- Preserve who completed each occurrence and when.
- Avoid schema or copy that encourages scoring/shaming.

### Recurrence rules

Use one documented recurrence engine/pattern across reminders, chores, calendar events, fixed payments, income, subscriptions and debt/mortgage schedules where feasible.

- Define supported frequency, interval, weekdays, month day, end date and count.
- Preserve local wall-clock intent using the rule timezone.
- Define month-end behaviour: a rule for day 29/30/31 uses the last valid day in shorter months unless the product explicitly offers “skip this month”.
- Define DST handling and test `Europe/Madrid` spring-forward and autumn-back transitions.
- Template edits affect future uncompleted occurrences from an explicitly selected effective date; never rewrite completed history.
- Generation is idempotent with a unique constraint on template/series plus occurrence key.

---

## Native calendar

Support:

- Timed and all-day events.
- Optional end time/date.
- Multi-day events.
- Location, notes and accessible colour/label.
- Documented recurrence subset plus exceptions.
- Event reminder timing.
- Soft deletion and restore.

Model all-day dates separately from timed UTC instants. Validate end after start. Preserve the event’s IANA timezone so recurrence does not drift across daylight-saving changes.

Calendar changes publish realtime updates to other household members and enqueue Google synchronization only after the database transaction commits through the outbox.

---

## Google Calendar integration

Follow current official Google documentation and the principle of least privilege. Do not improvise OAuth or synchronization from memory.

Reference documentation:

- OAuth web-server flow: <https://developers.google.com/identity/protocols/oauth2/web-server>
- Calendar scopes: <https://developers.google.com/workspace/calendar/api/auth>
- Incremental synchronization: <https://developers.google.com/workspace/calendar/api/guides/sync>
- Push notifications: <https://developers.google.com/workspace/calendar/api/guides/push>
- Extended properties: <https://developers.google.com/workspace/calendar/api/guides/extended-properties>
- Error handling: <https://developers.google.com/workspace/calendar/api/guides/errors>

### Google Cloud setup

Document, but do not attempt to fabricate, the required external setup:

- Google Cloud project.
- Google Calendar API enabled.
- Google Auth Platform branding, audience, support contact, privacy policy and exact authorized redirect URI.
- Production OAuth verification when required by the selected scopes and current Google policy.
- Separate development/staging and production OAuth clients where appropriate.

Request only the narrowest viable scope. For the dedicated app-created-calendar model, prefer `https://www.googleapis.com/auth/calendar.app.created` if it supports every implemented operation. Do not request broad `calendar` access merely for convenience. If a broader or additional scope is demonstrably necessary, document why the narrower scope fails and obtain explicit product approval before adding it.

### OAuth flow

- Use the OAuth 2.0 authorization-code flow for a server-side web application.
- Generate and validate high-entropy `state` tied to the authenticated owner, household, intended return path and short expiration. Use PKCE when supported by the chosen server library/flow.
- Request offline access so background synchronization can refresh access without the user present.
- Do not use `prompt=consent` on every connection; use it only when necessary to obtain a missing refresh token or re-consent.
- Exchange the code only on trusted server infrastructure.
- Validate the callback user is still authenticated and still owns the same household before storing the connection.
- Never expose authorization codes, access tokens or refresh tokens in client logs, URLs after callback, analytics, Sentry breadcrumbs or activity payloads.
- Store the refresh token encrypted at rest using a dedicated server-side encryption key held in Supabase Edge Function secrets or an equivalently strong documented mechanism.
- Keep token records in a private, non-Data-API schema. Store access tokens only in memory or short-lived encrypted storage when unavoidable.
- On `invalid_grant` or revoked access, pause sync, keep Home Hub data intact and show a Spanish reconnect state.

### Integration tables

Create private integration records equivalent to:

- `google_calendar_connections`: household, connecting user, encrypted refresh token, granted scopes, Google subject/account display metadata if consented, status, calendar ID, calendar timezone, last successful sync, last error category and timestamps.
- `google_calendar_sync_cursors`: connection/calendar, next sync token, full-sync state and last reconciliation.
- `google_calendar_channels`: connection/calendar, channel ID, resource ID, hashed or encrypted verification token, expiration, status and timestamps.
- `google_calendar_event_links`: Home Hub event/series, Google event ID, recurring Google event ID where relevant, etag, origin, last synchronized Home Hub version, Google update time, safe payload hash and sync state.
- `google_calendar_conflicts`: link, local snapshot, remote snapshot, detected time, resolution status and resolver—excluding secrets.
- Outbox/retry jobs for create, patch, delete, import, full sync, incremental sync, channel renew and reconciliation.

Exact names may follow repository conventions, but retain these responsibilities and constraints. Ensure a Home Hub event has at most one active link in the connected household calendar and a Google event maps to at most one Home Hub event.

### Initial connection and full sync

1. After successful OAuth, create the dedicated secondary Google calendar.
2. Persist its ID and timezone.
3. Perform a paginated full event sync before relying on incremental synchronization.
4. Persist `nextSyncToken` only after the final page completes successfully.
5. Establish an Events watch channel with a unique channel ID, high-entropy verification token, public HTTPS webhook and recorded expiration.
6. Mark the connection active only after the calendar, initial sync and durable metadata exist. If partial setup fails, preserve a recoverable state and retry safely rather than duplicating calendars.

Use Google private extended properties on Home Hub-created events, within documented limits, to record stable non-secret identifiers such as Home Hub event ID, household ID and schema/version marker. Never place tokens, private notes not intended for Google or sensitive finance data in extended properties.

### Change propagation

Home Hub → Google:

- Commit the Home Hub event first, activity row and outbox job in one transaction.
- A worker creates/patches/deletes the Google event idempotently and stores mapping ID, etag and synchronized version.
- Prefer partial `patch` operations so unrelated Google fields are not erased.
- Never send duplicate attendee invitations or Google updates unintentionally. Do not add attendee handling unless explicitly implemented and tested.

Google → Home Hub:

- The webhook contains change notification metadata, not the event body. Validate the known channel ID, resource ID and verification token, enqueue an incremental-sync job and respond quickly with success.
- Fetch changes with the stored sync token, handle pagination, apply each change transactionally and persist the next sync token only after the batch succeeds.
- If Google returns `410 Gone`, invalidate the cursor and perform a safe full resynchronization.
- Google cancellation/deletion soft-deletes the mapped Home Hub event so it can be reviewed/restored. Define how restoration recreates or reconnects the Google event.
- Import only supported ordinary events from the dedicated calendar. Preserve unsupported fields without destroying them on later patches, or mark them read-only with a clear compatibility status.

### Feedback-loop and conflict prevention

- Record origin and last synchronized versions/hashes so Home Hub’s own Google write does not echo back as a new semantic change.
- Use idempotency keys and unique mappings; webhook duplication and out-of-order delivery are normal conditions.
- If both Home Hub and Google changed materially since the last successful sync, do not silently overwrite either side. Create a conflict record, pause automatic writes for that event and expose a Spanish resolution flow choosing Home Hub, Google or a deliberate merged edit.
- Resolution is an audited, idempotent server operation that updates both sides and clears the conflict only after successful convergence.

### Recurring events

- Map recurring series deliberately. Preserve Google `recurringEventId`, recurrence rules, cancelled exceptions and `originalStartTime` semantics.
- Do not expand an infinite recurring series into unbounded rows.
- Support only the overlap between Home Hub’s documented recurrence subset and Google recurrence that is tested in both directions.
- Mark unsupported complex Google recurrence as read-only or require a safe simplification confirmation; never silently alter the rule.

### Watch channels and reliability

- Watch channels expire and cannot be renewed in place. A scheduled job creates a replacement channel before expiration, permits a controlled overlap and stops the old channel when safe.
- Google states notifications can be dropped. Treat webhooks as a latency optimization, not a correctness guarantee.
- Run periodic incremental/full reconciliation with jitter as a backstop.
- Do not trust message numbers to be sequential.
- The public webhook has JWT verification disabled only if required for Google delivery; compensate with exact channel/resource/token verification and ensure it can do nothing except enqueue a narrowly scoped sync.
- Apply bounded exponential backoff with jitter for transient Google failures and `403`/`429` rate limits. Do not retry permanent validation errors indefinitely.
- Surface a privacy-safe sync status, last-success time and actionable reconnect/resync error to the owner.

### Disconnect and deletion

- Stop active watch channels when possible.
- Revoke or delete stored tokens and destroy refresh-token ciphertext/key material as applicable.
- Mark event links disconnected without deleting Home Hub events.
- Do not delete the Google calendar by default.
- Make reconnection/resync idempotent and define whether existing extended-property links are reused.

### Google Calendar tests

Test with a fake Google adapter plus a small real staging-account checklist:

- OAuth state mismatch, expired state, callback for the wrong household and revoked refresh token.
- Initial full sync with pagination.
- Incremental sync, duplicate webhook, out-of-order webhook and missing webhook followed by reconciliation.
- Expired sync token/`410 Gone` full-resync recovery.
- Channel replacement and overlap.
- Create/update/delete from both Home Hub and Google.
- Feedback-loop prevention.
- Concurrent edits and conflict resolution.
- Timed, all-day, multi-day and recurring events across Europe/Madrid DST boundaries.
- Rate limiting, retry exhaustion and reconnect state.
- Household-owner removal/ownership transfer while a Google connection exists.

---

## Canonical household finance model

Prevent double-counting by using one canonical ledger for actual money movements. Module tables describe the source and workflow; reports aggregate linked ledger entries.

### Definitions

- `household_accounts` are optional user-managed text labels only. They contain a display name and archive state—no account numbers or connections.
- The manually maintained household balance is a dated snapshot of spendable/current-account money and excludes separately tracked savings-goal balances and liabilities.
- Monetary amounts are positive decimals. Direction and accounting treatment come from an explicit entry type, never from an undocumented sign convention.

Create a canonical `ledger_entries` model with household, date/time, amount, type, account label, category where applicable, description, status, provenance, actor and lifecycle fields. Source records/occurrences reference their unique ledger entry with an explicit foreign key. Do not use a loose source string as the only referential link.

### Accounting treatment

- Income increases spendable cash and counts as income.
- Ordinary expenses, grocery trip totals, fixed-payment occurrences and subscription occurrences reduce cash and count as spending/outgoings.
- A savings contribution reduces spendable cash and increases the linked savings asset. It appears in cash flow and savings allocation but is excluded from spending analytics; it does not change net position by itself.
- A mortgage/debt payment reduces cash. Principal reduces the liability; interest and fees count as spending. Principal must not be counted as ordinary category spending.
- A manual balance snapshot is a reference point, not an income/expense entry.
- Net position at a point in time is latest spendable balance plus tracked savings minus outstanding mortgage and other debts.
- Projected cash balance starts with the most recent balance snapshot and applies recorded movements after that snapshot plus eligible forecast occurrences. Display the snapshot/calculation time.

Each actual real-world movement is represented exactly once:

- Completing a shopping trip with a total creates one grocery expense ledger entry; it does not also create a variable-expense copy.
- Paying a subscription, fixed bill, mortgage or debt occurrence creates/links one ledger entry; it is not duplicated in the general expenses table.
- Editing the source updates the same entry transactionally.
- Soft deletion reverses/excludes the entry without destroying audit history.
- Restore reactivates the same link where safe.

### Finance modules

Implement:

- Income sources and materialized expected/received occurrences.
- Fixed-payment templates and occurrences, with expected versus actual amount/date.
- Fast one-off expenses with user-confirmed category suggestions based only on the household’s own past descriptions.
- Monthly total budget and per-category envelopes, allocation remainder, pace, thresholds and optional rollover.
- Savings goals and contribution log.
- Monthly savings-plan purposes and planned versus actual contributions.
- Mortgage, schedule, principal/interest split, extra payments and balance history.
- Other debts, payments, interest/fees and balance history.
- Subscriptions, renewals, active/cancelled status and monthly/annual equivalent reporting.
- Dated balance snapshots.
- Thirty-day cash-flow projection.
- Spending analytics by category/month/account label, comparisons and descriptive insights.

### Finance invariants

- Savings progress equals active contributions.
- Mortgage/debt current balance equals the authoritative starting/opening balance minus applied principal reductions plus explicit balance adjustments. Never reduce it by interest.
- A paid occurrence and its ledger entry transition atomically.
- Editing/deleting/restoring a source recalculates all affected reports.
- Past occurrences are not rewritten when a template changes.
- Budget rollover is materialized once per category/month with unique constraints and idempotency.
- Threshold notifications have one deduplication key per budget/threshold/month.
- Reports exclude soft-deleted, cancelled, skipped and unconfirmed movements as appropriate.
- Do not calculate authoritative totals in the browser.

Use SQL views/functions or a tested service layer for complex reporting. Ensure every query is household-scoped and index the common date/category/account/status filters.

---

## Notifications and background processing

Implement Web Push with VAPID, per-device subscriptions, an in-app notification centre and per-user preferences.

- One user may have multiple device subscriptions.
- Store endpoint and key material server-side with RLS preventing cross-user access.
- Support category preferences, quiet hours and connected-device revocation.
- Use household/user timezone correctly; initial default is Europe/Madrid.
- iOS UI must explain the supported installed-PWA requirement, but server logic must remain standards-based.
- Notification body text never contains exact financial amounts, balances or other sensitive finance details.
- In-app notification detail may link to authenticated content.

Use scheduled/outbox workers for due reminders, chore occurrences, calendar reminders, payments, subscription renewals, budget thresholds, expiring documents, optional month-end recap and Google Calendar maintenance.

Requirements:

- Unique deduplication key per recipient/event/category/scheduled occurrence.
- Atomic claim/lease semantics for workers.
- Retry transient delivery failures with capped backoff.
- Mark expired/invalid push subscriptions inactive.
- Respect quiet hours by deferring—not dropping—eligible notifications.
- Record privacy-safe delivery attempts and terminal errors.
- Month-end recap generation is idempotent and links to the relevant month.

---

## Documents, wishes, search, trash and export

### Documents

Store metadata only: title, category, expiry/renewal date, notes and optional validated external URL. Do not implement file upload in v1. Generate expiry occurrences/notifications idempotently.

### Wishes

Store name, approximate price, priority, link, notes and purchased state. Use a unique household/user/item vote constraint so one member has at most one active vote per item.

### Global search

Implement household-scoped search across the required modules. Use Postgres full-text search and/or trigram indexes appropriate for Spanish and accent-insensitive matching. Return grouped, typed results with a safe title/snippet and route target. RLS must apply to search results; do not build an elevated global index that leaks other households.

### Trash

Provide a unified view over supported soft-deleted record types with record type, safe label, deleter, deletion time and restore eligibility. Restore/permanent-delete operations use an allow-listed entity type registry, explicit authorization and per-type dependency checks. Do not construct arbitrary SQL identifiers from client input.

### Household data export

Generate authenticated JSON and CSV exports through an owner-authorized asynchronous job. Include household-owned product data and necessary metadata; exclude secrets, OAuth tokens, push keys, password/auth internals and internal operational logs. Store generated export files temporarily with signed, expiring access and a documented retention/deletion period.

---

## AI assistant

The assistant turns natural Spanish household requests into proposed actions. It never performs a write silently.

Architecture:

- Server-side provider-neutral AI adapter.
- Strict allow-listed tool/action registry with Zod schemas.
- The model produces structured proposals, not SQL and not arbitrary function names.
- Read context is household-scoped and minimized to what the request needs.
- A proposal is stored as a short-lived `pending_ai_action` tied to user, household, schema version and a hash of the normalized payload.
- The interface shows exactly what will be changed and asks for explicit confirmation.
- Confirmation revalidates authentication, membership, permissions, payload, referenced-record versions and expiration, then calls the same domain service used by ordinary UI actions.
- Execution is idempotent and activity-logged.
- Clarify missing/ambiguous required fields instead of guessing.
- Never invent an amount, date, member, category or financial fact.
- Treat stored household text as untrusted data and defend against prompt injection contained in recipes, notes, documents or event text.
- Do not expose system prompts, secrets, other households or raw database errors.

Initial actions may include adding shopping items, creating a reminder and recording a one-off expense. Expand the allow-list only after those paths are tested end to end.

---

## Realtime

Use Supabase Realtime for near-real-time member collaboration on relevant household tables.

- Authorize subscriptions through RLS/private channels as supported by the chosen Supabase pattern.
- Subscribe only to the active household and only to tables needed by the current screen.
- Merge changes into client caches without duplicating optimistic updates.
- Reconnect and refetch after channel gaps.
- Do not broadcast OAuth tokens, private integration rows, push key material or internal job data.
- Realtime is a UI freshness mechanism; after reconnect, a normal query is authoritative.

---

## Security and privacy hardening

- Validate every external input with Zod/server validation and database constraints.
- Use parameterized queries. Never interpolate identifiers or values from user input into SQL.
- Configure allowed redirect URLs exactly; prevent open redirects.
- Apply CSRF protection to cookie-authenticated state-changing server endpoints where the framework does not already provide an equivalent guarantee.
- Rate-limit authentication-adjacent endpoints, invite redemption, AI requests, export creation and OAuth initiation/callback abuse.
- Set secure headers and an intentional Content Security Policy compatible with Supabase and Google OAuth.
- Never log secrets, access/refresh tokens, authorization codes, full push subscriptions, private finance payloads or exported household data.
- Redact sensitive structured fields in error reporting.
- Keep service-role usage narrow and auditable.
- Pin trusted Edge Function dependencies and validate webhook payload/header sizes.
- Document retention and deletion behaviour for exports, integration metadata, activity and deleted records.
- Provide an account/household deletion path with explicit ownership checks and a documented consequence model.
- Follow Google API Services User Data Policy requirements for consent, data use, retention and deletion.

---

## Testing and quality gates

Use the repository’s established tools, adding suitable ones only when absent. Cover:

### Database and RLS

- Migrations apply cleanly from an empty database and in upgrade order.
- Constraints and concurrency tests enforce household/member caps, unique occurrences, votes, ledger links and idempotency.
- RLS positive and negative cases for each role and module.
- Finance calculation tests with edits, deletion, restore and month boundaries.
- Recurrence tests including leap years, month-end and Europe/Madrid DST.

### Server and integrations

- Authenticated/unauthenticated and authorized/unauthorized operations.
- Outbox claim, retry, deduplication and poisoned-job handling.
- Notification quiet hours, privacy-safe copy and duplicate prevention.
- Google Calendar cases listed in its dedicated test section.
- AI proposal, clarification, tampering, expiry, stale-record conflict, confirmation and replay.

### Frontend integration

- Existing primary journeys use real services, not fixtures.
- Spanish loading, empty, validation, conflict, offline and error states.
- Optimistic/realtime reconciliation.
- Keyboard and screen-reader-critical behaviour.
- Mobile viewport behaviour for shopping, quick expense and calendar.

### Required final commands

Run and report the actual repository commands for:

- Formatting/checking
- Lint
- Type-check
- Unit/integration tests
- RLS/database tests
- End-to-end smoke tests
- Production build

Do not say “all tests pass” without running them. If an external integration prevents a live test, clearly distinguish adapter tests from the documented staging-account verification checklist.

---

## Delivery phases

### Phase 0 — Repository and contract audit

- Inspect the Stitch front end and current codebase.
- Freeze the accepted route/component/data contracts.
- Establish environment validation, Supabase clients, migration/test tooling and architecture documentation.

### Phase 1 — Secure foundation

- Auth/profile lifecycle.
- Households, membership, invitation transactions and household switching.
- RLS helpers and policy-test harness.
- Activity log, outbox and realtime foundation.

### Phase 2 — Everyday household use

- Categories, shopping/offline mutation API, recipes and menus.
- Reminders, chores, recurrence engine and native calendar.
- Complete real-data integration of these existing front-end flows.

### Phase 3 — Google Calendar

- Google Cloud setup documentation and environment contract.
- OAuth, encrypted token storage and dedicated calendar creation.
- Full/incremental sync, watch channels, reconciliation, conflicts and disconnect.
- Complete fake-adapter test suite and staging checklist.

### Phase 4 — Canonical finance

- Account labels, ledger and balance snapshots.
- Income, expenses, shopping-spend link, fixed payments and subscriptions.
- Budgeting, savings, mortgage, debts, cash flow and analytics.
- Finance notification events and calculation tests.

### Phase 5 — Platform features

- Web Push and notification centre.
- Documents, wishes/votes, global search, trash/restore and export.
- Activity/history surfaces and settings integration.

### Phase 6 — AI assistant

- Provider adapter, allow-listed structured actions, proposal/confirmation lifecycle, audit and tests.

### Phase 7 — Hardening and release readiness

- Security/privacy review.
- Realtime/offline/conflict review.
- Performance/index analysis.
- Accessibility and end-to-end regression.
- Production build, deployment/runbooks, backup/recovery and external-console checklist.

---

## Definition of done

The backend integration is complete only when:

- Every required front-end flow reads and writes real authorized data.
- Database constraints and RLS protect tenant boundaries even against direct API calls.
- No financial movement is double-counted and all defined invariants have automated tests.
- Recurrence, notifications and Google sync are idempotent and recover from retries.
- Google Calendar synchronization does not read personal calendars and handles webhook loss, channel expiry, expired sync tokens, conflicts and revoked OAuth access.
- OAuth and other secrets never reach browser bundles, client-readable tables, logs or exports.
- Soft deletion, restore and activity history work consistently.
- Spanish error and state handling is complete.
- Realtime and offline shopping behaviour reconcile with authoritative server state.
- Tests, type-checking, linting and the production build pass.
- Setup documentation identifies every environment variable and every required Supabase, Vercel and Google Cloud console step without including secret values.
- There are no fake success paths, placeholder controls or undocumented manual database steps.

At final handoff, provide:

1. Concise architecture summary.
2. Migration/schema summary.
3. Security and RLS summary.
4. Google Calendar synchronization and privacy summary.
5. Environment-variable names and external setup checklist.
6. Commands run and their results.
7. Any genuine remaining risks or external verification steps.

Do not expose real credentials or secret values in the handoff.

