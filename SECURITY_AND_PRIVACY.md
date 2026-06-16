# SECURITY_AND_PRIVACY.md — Home Hub

## Threat model summary

Home Hub stores private household data for exactly two people: shopping habits, meal plans, reminders, chore assignments, calendar events (some marked private to one partner), and — most sensitively — manual financial data (fixed payments, payment history, expenses, savings goals, subscriptions, weekly shopping spend) and household document metadata (e.g. expiry dates of contracts/insurance). The primary security goal is **strict isolation between households** and **no access by anyone outside the two account holders**, including no accidental public exposure via misconfigured RLS, a leaked key, or a public repo.

Push notifications add a second, narrower dimension to that goal: **strict isolation between the two household members' own devices and preferences.** Even though the two partners share almost all household data, push subscriptions, notification preferences, and a user's own notification feed are personal — a household member should never be able to see, modify, or trigger a notification on their partner's device.

There is no payment processing, no bank connectivity, and no third-party data sharing in this product, which significantly limits the attack surface compared to a typical fintech app — but the household data is still personal and must be treated as sensitive.

## Authentication and access

- Supabase Auth (email + password) is the only authentication method in MVP.
- Every household-scoped table has Row Level Security **enabled**, with policies scoped through the `is_household_member(household_id)` helper (see `DATA_MODEL.md`). No table is publicly readable; no table allows cross-household reads or writes.
- Household invite codes are random, unique, and **must have an expiry** (`expires_at`). Codes are redeemed through a `security definer` RPC (`redeem_household_invite`), not a direct `select`/`insert` against `household_invites`, so codes cannot be enumerated or guessed by listing the table.
- A user can only ever be a member of the households they were either the creator of or redeemed a valid invite for.

## Secrets management

- No secrets are ever committed to the repository. `.gitignore` excludes `.env`, `.env.local`, `.env.*.local`, and `.claude/` — these exclusions must never be removed.
- `.env.example` documents required variable **names** only, with empty values:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  NEXT_PUBLIC_VAPID_PUBLIC_KEY=
  ```
- The **Supabase service role key is never used in this project's client code** and is not required for the MVP feature set (all access is via the anon key + RLS). If a future feature genuinely requires elevated privileges, it must run server-side only (a Next.js Route Handler/Server Action), read the key from a server-only environment variable, and never be bundled into client JavaScript.
- The **VAPID private key** (Web Push) follows the same rule as the service role key: server-only, never in `NEXT_PUBLIC_*`, never committed. It's generated locally (no external account needed — a local keypair, not a third-party credential) and stored as a Supabase Edge Function secret, since the Edge Function is what actually sends pushes. Only `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is client-safe (the public key is, by design, safe to expose — it's what the browser uses to create a subscription, not what's used to send).
- Real environment values are configured directly in the Vercel project dashboard/MCP for deployed environments, and in a local, untracked `.env.local` for local development. Neither is ever pasted into a commit, a planning doc, or a chat transcript that could be persisted insecurely.

## No bank integrations

- This product **never** connects to a bank, card provider, Open Banking API (e.g. PSD2 aggregators), or any financial institution.
- Finance modules (`fixed_payments`, `payment_instances`, `expenses`, `savings_goals`, `savings_contributions`, `subscriptions`, weekly shopping spend via `shopping_lists`/`shopping_trips`) are 100% manual entry. There is no transaction import, no automatic categorisation of bank data, and no financial account linking feature, now or planned.
- No financial, tax, or legal advice is given anywhere in the product — only transparent arithmetic on user-entered data (e.g. summing fixed payments for a monthly total).

## Data handling

- Manual finance entry only — see above.
- Household document uploads are **optional and not required** in the MVP; the schema stores metadata and an optional plain-text URL (`storage_url`), not a file blob. If Supabase Storage is added later, it must be configured with its own RLS-equivalent bucket policies scoped to household membership before any file upload feature ships.
- No data is shared with third parties. No analytics SDK that exfiltrates personal household content should be added without explicit user approval; basic, privacy-respecting deployment analytics (e.g. Vercel's own platform analytics) are acceptable but should not log financial amounts or personal content in any custom event payloads.
- Logging (server logs, error tracking) must not include personal data values — log entity types and IDs, not field contents (e.g. log "expense created" with an ID, not the amount or notes text) where practical. Avoid verbose `console.log` of full row objects in code that could end up in production logs.
- Data export (`/ajustes/privacidad`, JSON/CSV) is generated on demand for the requesting user's own household only (scoped by the same RLS as everything else) and downloaded directly to their device — never emailed, never written to a publicly accessible storage path, never cached server-side beyond the request that generates it.

## Push notification security

Push notifications are a core v1 feature (see `PRODUCT_REQUIREMENTS.md`), which means their security and privacy properties matter as much as any other core data path — they are not an optional bolt-on that gets a lighter security pass.

- **Scoping:** `push_subscriptions` and `notification_preferences` are scoped by both `household_id` and `user_id`; every RLS policy on these tables requires `user_id = auth.uid()` in addition to household membership — a user manages only their own subscriptions/preferences, never their partner's, even though they're in the same household. `notification_events` (the in-app feed) is likewise scoped to `user_id = auth.uid()` for reads.
- **Least privilege on functions:** following the pattern already established for `is_household_member`/`create_household` (see `sql/004`–`007`), any new security-definer function added for notifications gets EXECUTE revoked from `anon`/`public` and granted only to the roles that actually need it (`authenticated` for user-facing RPCs, the Edge Function's service-role connection for the sender).
- **VAPID key handling:** the private key lives only as a Supabase Edge Function secret, set via the Supabase CLI/dashboard (not committed, not in Vercel, not in client code). The public key is the only part exposed to the browser, via `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
- **No secrets in logs:** never log a full push subscription (`endpoint`, `p256dh`, `auth_key`) or full notification payload body in plaintext. `notification_delivery_attempts.error_message` may contain a push-service error string but never subscription keys or notification content.
- **Unsubscribe/deactivate:** a device can always be deactivated (`push_subscriptions.is_active = false`, `deactivated_at` set) from `/ajustes/dispositivos` or `/ajustes/notificaciones`; a deactivated subscription is never targeted by the sender again.
- **No sensitive finance content in push bodies:** notification text must never include exact amounts, balances, or other sensitive finance detail. Use generic phrasing and let the user open the app (after login) for detail. Examples:

  **Good:**
  - "Tienes un pago próximo"
  - "Recordatorio: cita médica a las 18:00"
  - "Una tarea vence hoy"
  - "Tienes una suscripción próxima a renovar"
  - "Hay elementos pendientes en la compra"
  - "Tu menú semanal necesita revisión"

  **Avoid:**
  - "Hipoteca de 1.250 € vence mañana"
  - "Saldo bajo en cuenta bancaria"
  - "Pago de seguro de salud de 780 € vence el viernes"
  - "[Partner's name] ha gastado 240 € en supermercado"

  This applies to `scheduled_notifications.title`/`body` and `notification_events.title`/`body` — the generic text is what's generated and stored, not a presentation-layer filter applied later. A more detailed, opt-in "detailed finance notifications" mode could be added post-MVP but is off by default and not built in v1.
- **No unauthenticated notification endpoints:** any HTTP-triggerable surface for notifications (the Edge Function included) must authenticate the caller (Supabase Cron's invocation is itself authenticated via the project's service role; there is no public HTTP endpoint that accepts arbitrary "send a notification" requests).
- **Target validation:** the sending function validates that a `scheduled_notifications` row's target (`user_id`, or every member when null) is still a current household member and that the underlying entity (reminder, calendar event, etc.) hasn't been completed/deleted/cancelled since the row was scheduled, before sending — a stale or orphaned row is skipped, not sent.
- **Idempotency:** `scheduled_notifications.idempotency_key` is unique, so re-running the scan/send process (retry, overlapping Cron invocations, etc.) can never result in the same occurrence being pushed twice. Snoozing/rescheduling updates or replaces the existing row rather than leaving a duplicate.

## Confirmations for destructive actions

- Every delete action in the UI (shopping item, reminder, chore, recipe, payment, expense, goal, subscription, document, wishlist item, category, calendar event, shopping list, push device) requires an explicit confirmation step before executing ("¿Seguro que quieres eliminarlo?").
- For soft-deletable records (finance, payments, savings goals, documents, calendar events, reminders, shopping lists — see `DATA_MODEL.md`), the confirmation step still applies even though the action is reversible via "Restaurar" — a confirmation prevents accidental clutter in the trash view, not just data loss.
- Destructive Supabase schema operations (dropping/altering tables or columns, deleting rows in bulk) are never performed by Claude Code without first explaining exactly what will change and getting confirmation.
- No `git push --force`. No making the GitHub repository public. No skipping commit hooks.

## Deployment security

- Environment variables for the deployed app are configured in Vercel, not committed.
- Only the public, anon-key-based Supabase configuration (plus the VAPID public key) is exposed to the client; this is safe by design because RLS enforces access control at the database level regardless of what the client requests.
- HTTPS is enforced by default via Vercel; no custom insecure transport configuration is introduced. Web Push requires HTTPS, which Vercel provides by default.
- Scheduled/background processing (notification scanning and sending, recurring-occurrence generation) runs via **Supabase Cron + Supabase Edge Functions**, not Vercel cron — Vercel's Hobby-tier cron is not reliable enough for time-sensitive reminders and is explicitly not used for this.
- Dependencies are kept to the documented list in `CLAUDE.md`; new dependencies should be added only when justified, to limit supply-chain risk.

## Ongoing responsibilities (for future Claude Code sessions)

- Before applying any new Supabase migration, re-read the affected table's RLS policy intent in `DATA_MODEL.md` and ensure the new migration doesn't weaken it.
- Before adding any new third-party package or service integration, confirm it doesn't introduce a bank/financial-data integration, and that no secrets are required client-side.
- Before adding any new notification trigger (a new category, a new entity type that schedules notifications), check its generated `title`/`body` text against the "privacy-safe notification examples" above — if it would surface an exact amount, balance, or similarly sensitive detail, rewrite it generically.
- Periodically re-verify (manually, see `TEST_PLAN.md`) that a non-member account cannot read another household's data — this is the single most important invariant in the whole app — and, separately, that a household member cannot read or modify their partner's push subscriptions, notification preferences, or notification feed.
