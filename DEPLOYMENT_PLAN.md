# DEPLOYMENT_PLAN.md — Home Hub

## Overview

Home Hub deploys as a standard Next.js App Router application on Vercel, backed by a Supabase project (Postgres + Auth) reached only via the public anon key from the client, with RLS as the real access-control boundary. **Vercel hosts the app only.** All scheduled/background processing — notification due-date scanning and Web Push delivery, recurring-occurrence generation — runs on **Supabase Cron + Supabase Edge Functions**, deliberately not on Vercel's cron (Hobby-tier Vercel cron is not reliable enough for time-sensitive reminders).

## Pre-deployment checklist

- [ ] `npm run build` succeeds locally with no errors.
- [ ] `npm run lint` and `npm run typecheck` pass with no errors.
- [ ] Supabase schema (`sql/001_initial_schema.sql` through the latest migration) has been applied to the target Supabase project via MCP, and RLS/policies verified.
- [ ] `.env.example` is up to date with every required client env var, including `NEXT_PUBLIC_VAPID_PUBLIC_KEY` once notifications are built.
- [ ] No `.env`, `.env.local`, or secret values are committed (`git ls-files | grep -i env` returns nothing beyond `.env.example`).
- [ ] User has confirmed creation/linking of the Vercel project (do not create or link without asking first).
- [ ] Before notifications go live: VAPID keys generated, private key set as a Supabase Edge Function secret, public key added to Vercel env vars; the Edge Function deployed; the Supabase Cron schedule created and confirmed active.

## Environment variables

**Vercel** (app hosting) — set in the Vercel project's Environment Variables settings (Production, and Preview if used) — never committed:

| Variable | Value source | Client-exposed? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project API settings (via Supabase MCP `get_project_url`) | Yes — safe, it's a public endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project API settings (via Supabase MCP `get_publishable_keys`) | Yes — safe by design, RLS enforces access |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Generated locally (`npx web-push generate-vapid-keys` or equivalent) — added once Milestone 15 (notifications) is built | Yes — the public key is safe to expose by design |

No service role key is configured in Vercel for this project. If a future server-only feature needs it, it would be added as a non-`NEXT_PUBLIC_` variable, read only in server-side code, and documented here explicitly before being set.

**Supabase Edge Function secrets** (notification sending, set via Supabase CLI/dashboard, not Vercel):

| Secret | Notes |
|---|---|
| `VAPID_PRIVATE_KEY` | Server-only. Never in Vercel, never in client code, never committed. |
| `VAPID_SUBJECT` | A `mailto:` contact address required by the Web Push protocol — not sensitive, but lives alongside the private key for convenience. |

Setting these requires either the Supabase CLI (`supabase secrets set`) or the Supabase dashboard — confirm which is available before this step; if neither is accessible via the current toolset, this is a "stop and ask the user" point per `CLAUDE.md`.

## Build command and runtime assumptions

- Build command: `next build` (Vercel's default Next.js detection handles this automatically; no custom `vercel.json` build override expected).
- Install command: `npm install` (default).
- Output: standard Next.js App Router build (`.next/`), deployed as Vercel's managed Next.js runtime (serverless/edge functions as Next.js determines per route).
- Node version: whatever Vercel's current default LTS is for new projects, unless the local dev Node version (currently v21.7.0) requires pinning via `engines` in `package.json` — pin only if a build failure indicates a version mismatch.
- No custom server, no Docker, no separate API service.

## Deployment steps

1. Confirm pre-deployment checklist above is fully green.
2. **Ask the user to confirm** before creating or linking a Vercel project (use Vercel MCP `list_projects`/`list_teams` to check if one already exists for `home-hub` first; reuse it if so).
3. Link the repository to the Vercel project (via Vercel's GitHub integration or MCP deployment tooling).
4. Set the two environment variables above in the Vercel project settings.
5. Trigger a deployment (push to `main`, or via Vercel MCP `deploy_to_vercel` if used directly).
6. Use Vercel MCP `get_deployment` / `get_deployment_build_logs` to confirm the build succeeded.
7. Visit the deployed URL and manually verify: login page loads, a full signup → onboarding → dashboard flow works against the real Supabase project, and the app is installable as a PWA on a phone.
8. Use Vercel MCP `get_runtime_logs` if anything looks broken at runtime, to diagnose before making code changes.
9. **Once notifications are built (Milestone 15):** deploy the Edge Function via Supabase MCP `deploy_edge_function`; set its secrets (VAPID private key, subject); create/confirm the Supabase Cron schedule that invokes it; send a real test push end-to-end before considering deployment complete.

## Deployment checks (post-deploy)

- [ ] Deployed URL is reachable over HTTPS.
- [ ] `/` redirects correctly based on auth/household state.
- [ ] Auth flow works end-to-end against the production Supabase project.
- [ ] No console errors in the browser on first load of `/dashboard`.
- [ ] Manifest/PWA install prompt available on a real mobile browser.
- [ ] No secrets visible in client-side bundle (spot-check Network/Sources tab for anything beyond the public env vars — Supabase URL/anon key, VAPID public key).
- [ ] (Once notifications are live) A real push notification is received on a real device after enabling it through `/ajustes/notificaciones` and pressing "Probar notificación"; the Supabase Cron job shows successful recent runs.

## Rollback plan

- Vercel keeps prior deployments; if a new deployment introduces a regression, use the Vercel dashboard/MCP to **promote the previous successful deployment back to Production** rather than rushing a fix forward.
- Because Supabase schema changes are applied independently of Vercel deploys, never roll back a Vercel deployment that expects an *older* schema if a newer, incompatible migration has already been applied to the Supabase project — check `DATA_MODEL.md`/migration history first. Prefer forward-fixing schema-related regressions over rolling back the app when the two have diverged.
- Any rollback is communicated to the user with what was rolled back and why before/while doing it, since it affects the live app both partners use.

## Inspecting Vercel via MCP

- `list_projects` / `list_teams` — find the right project/team before assuming one needs to be created.
- `get_deployment`, `list_deployments` — check current/recent deployment status.
- `get_deployment_build_logs` — diagnose build failures.
- `get_runtime_logs` — diagnose post-deploy runtime errors.
- `get_project` — confirm configured environment variables and settings (without printing secret values back into chat/files).

## Inspecting Supabase via MCP

- `list_projects`, `get_project`, `get_project_url`, `get_publishable_keys` — confirm which project is the deployment target and retrieve client-safe configuration.
- `list_tables`, `list_migrations` — confirm schema state matches `DATA_MODEL.md` before/after a deploy.
- `get_advisors` — check for security/performance advisories (e.g. missing RLS) before and after schema changes.
- `get_logs` — diagnose database-level errors (and, once built, Edge Function invocation errors via `service: 'edge-function'`) if the deployed app or notification pipeline reports failures.
- `deploy_edge_function`, `list_edge_functions`, `get_edge_function` — deploy and inspect the notification-sending Edge Function (Milestone 15).
- Supabase Cron job creation/inspection: confirm via `execute_sql` against `cron.job` (the `pg_cron` extension's catalog) whether the scheduled job exists and ran recently, since no dedicated MCP tool manages Cron schedules directly — this may require the Supabase CLI/dashboard if `pg_cron` isn't already enabled on the project (check via `list_extensions` first).

## Explicitly out of scope for deployment

- No custom domain configuration unless requested.
- No staging/preview environment with separate Supabase data unless requested — MVP uses one Supabase project for both local dev and production (acceptable for a private two-person household app; revisit if this ever needs to change).
- No CI pipeline beyond Vercel's own build-on-push in MVP.
- No Vercel cron jobs of any kind — all scheduling is Supabase Cron, by explicit requirement.
