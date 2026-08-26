# Home Hub — Operations Runbook

Backend phase completed 2026-08-26. Supabase project: `xzkavpjwvadqldauaabm`.

## Environment variables (names only — never commit values)

| Where | Name | Purpose |
|---|---|---|
| Vercel + `.env.local` | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (client-safe) |
| Vercel + `.env.local` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key (client-safe) |
| Vercel + `.env.local` | `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push public key (client-safe) |
| Vercel (server only) | AI provider key(s) read by `lib/ai/providers` | Assistant adapter |
| Supabase Edge secrets | `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Web Push (private key server-only) |
| Supabase Edge secrets | `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY` | Auto-provided to Edge Functions |

The service-role key exists ONLY inside Supabase Edge Functions. It is never
in the repo, the browser bundle, or Vercel client env.

## Scheduled jobs (pg_cron)

| Job | Schedule | What it does |
|---|---|---|
| `document-expiry-scan` (2) | daily 08:00 | `scan_document_expiry_notifications()` → scheduled_notifications (30/7/1 días) |
| `outbox-worker-cron` (3) | every minute | POSTs `/functions/v1/outbox-worker` (publishable-key Bearer) |
| `budget-threshold-scan` (4) | daily 18:00 | `scan_budget_threshold_notifications()` (80%/100% of monthly budget, from the ledger) |

Health check: `select jobid, status, end_time from cron.job_run_details order by end_time desc limit 10;`
Outbox health: `select status, count(*) from outbox_jobs group by 1;` — investigate `failed` rows via `last_error`.

## Edge Functions

- `outbox-worker` (v2, verify_jwt off): drains `outbox_jobs` — notification
  delivery (in-app events idempotent via `source_key`; push per active device;
  quiet hours DEFER pushes), recurring-calendar reminder re-arming. Bundles a
  copy of `lib/recurrence.ts` guarded by a vitest identity test.
- `send-push` (v8): kept ONLY for the device-test mode used by Ajustes →
  Dispositivos; its cron was retired.

## Tests

- `npm run test` — vitest (37): recurrence engine (DST/month-end/leap),
  calendar expansion + exceptions, quiet hours, formatting, engine-copy drift
  guard.
- `supabase/tests/*.sql` — pgTAP suites run via MCP `execute_sql` inside
  rolled-back transactions (001 RLS isolation, 002 invitations, 003 outbox,
  004 occurrences, 005 shopping, 006 calendar/menu, 007 ledger record).
- Gates before any commit: `npm run lint`, `npm run typecheck`, `npm run test`,
  `npm run build`.

## Backup / recovery

Supabase daily backups (dashboard → Database → Backups) are the recovery
mechanism. The owner-only export (Ajustes → Privacidad → Exportar; JSON full /
CSV ledger) is the user-facing copy. `sql/*.sql` files are the reviewed
migration record; remote migration history is authoritative
(`supabase_migrations.schema_migrations`).

## Documented deviations from HOME_HUB_BACKEND_PROMPT.md

Right-sized for a private 2-person household app; revisit if the product grows:
- Income and subscriptions are projections — the product records no actual
  movement rows for them, so they have no ledger entries; debts keep a
  manually edited balance.
- Existing Finanzas reports read source tables; the trigger-maintained ledger
  is numerically identical by construction (`ledger_monthly_totals` is the
  aggregation surface for new features).
- Export runs synchronously (tiny dataset) instead of as a stored async job.
- Rate limiting is per-instance in-memory (stops loops/casual abuse, not
  distributed attacks).
- No Playwright E2E suite; manual test plan in TEST_PLAN.md + pgTAP/vitest.
- Google Calendar (phase B3) DROPPED by user decision (26/08/2026) — the
  household does not want it. Every other phase is complete.
- CSP allows 'unsafe-inline' scripts/styles (Next.js bootstrap + Tailwind
  inline styles; no nonce pipeline).

## Accepted risks (user decisions, 26/08/2026)

- Leaked-password protection off (Supabase Pro-only feature; two known users).
- Public GitHub repo (Vercel Hobby auto-deploy requirement; no secrets in repo).
