# SECURITY_AND_PRIVACY.md — Home Hub

## Threat model summary

Home Hub stores private household data for exactly two people: shopping habits, meal plans, reminders, chore assignments, and — most sensitively — manual financial data (fixed payments, expenses, savings goals, subscriptions) and household document metadata (e.g. expiry dates of contracts/insurance). The primary security goal is **strict isolation between households** and **no access by anyone outside the two account holders**, including no accidental public exposure via misconfigured RLS, a leaked key, or a public repo.

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
  ```
- The **Supabase service role key is never used in this project's client code** and is not required for the MVP feature set (all access is via the anon key + RLS). If a future feature genuinely requires elevated privileges, it must run server-side only (a Next.js Route Handler/Server Action), read the key from a server-only environment variable, and never be bundled into client JavaScript.
- Real environment values are configured directly in the Vercel project dashboard/MCP for deployed environments, and in a local, untracked `.env.local` for local development. Neither is ever pasted into a commit, a planning doc, or a chat transcript that could be persisted insecurely.

## No bank integrations

- This product **never** connects to a bank, card provider, Open Banking API (e.g. PSD2 aggregators), or any financial institution.
- Finance modules (`fixed_payments`, `expenses`, `savings_goals`, `savings_contributions`, `subscriptions`) are 100% manual entry. There is no transaction import, no automatic categorisation of bank data, and no financial account linking feature, now or planned.
- No financial, tax, or legal advice is given anywhere in the product — only transparent arithmetic on user-entered data (e.g. summing fixed payments for a monthly total).

## Data handling

- Manual finance entry only — see above.
- Household document uploads are **optional and not required** in the MVP; the schema stores metadata and an optional plain-text URL (`storage_url`), not a file blob. If Supabase Storage is added later, it must be configured with its own RLS-equivalent bucket policies scoped to household membership before any file upload feature ships.
- No data is shared with third parties. No analytics SDK that exfiltrates personal household content should be added without explicit user approval; basic, privacy-respecting deployment analytics (e.g. Vercel's own platform analytics) are acceptable but should not log financial amounts or personal content in any custom event payloads.
- Logging (server logs, error tracking) must not include personal data values — log entity types and IDs, not field contents (e.g. log "expense created" with an ID, not the amount or notes text) where practical. Avoid verbose `console.log` of full row objects in code that could end up in production logs.

## Confirmations for destructive actions

- Every delete action in the UI (shopping item, reminder, chore, recipe, payment, expense, goal, subscription, document, wishlist item, category) requires an explicit confirmation step before executing ("¿Seguro que quieres eliminarlo?").
- Destructive Supabase schema operations (dropping/altering tables or columns, deleting rows in bulk) are never performed by Claude Code without first explaining exactly what will change and getting confirmation.
- No `git push --force`. No making the GitHub repository public. No skipping commit hooks.

## Deployment security

- Environment variables for the deployed app are configured in Vercel, not committed.
- Only the public, anon-key-based Supabase configuration is exposed to the client; this is safe by design because RLS enforces access control at the database level regardless of what the client requests.
- HTTPS is enforced by default via Vercel; no custom insecure transport configuration is introduced.
- Dependencies are kept to the documented list in `CLAUDE.md`; new dependencies should be added only when justified, to limit supply-chain risk.

## Ongoing responsibilities (for future Claude Code sessions)

- Before applying any new Supabase migration, re-read the affected table's RLS policy intent in `DATA_MODEL.md` and ensure the new migration doesn't weaken it.
- Before adding any new third-party package or service integration, confirm it doesn't introduce a bank/financial-data integration, and that no secrets are required client-side.
- Periodically re-verify (manually, see `TEST_PLAN.md`) that a non-member account cannot read another household's data — this is the single most important invariant in the whole app.
