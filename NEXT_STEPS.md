# Next Steps

## Current: Milestone 21 — Deployment (Vercel)

### Scope
1. Confirm local production build succeeds (already confirmed in M20)
2. Ask user to confirm before creating/linking the Vercel project (or verify it already exists)
3. Configure environment variables in Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
4. Deploy via Vercel MCP; check build/runtime logs and fix any errors
5. Confirm Supabase Cron jobs are active and the Edge Function is deployed

### Notes
- VAPID private key and Supabase secrets stay in Supabase Edge Function secrets — NOT in Vercel env vars
- Check with user before creating a new Vercel project if one already exists — reuse existing infra
- Use Vercel MCP tools for all deploy/env var work

### Commit
- Any deployment-related code changes: `Prepare Vercel deployment`

## After Milestone 21: Milestone 22 (Final review)
- Re-check every screen for stray English text
- Re-check no secrets committed
- Smoke-test every module's core CRUD
- Real push notification end-to-end test on a real device
- Re-verify RLS cross-household access denial
- Re-check mobile usability and install-guidance flow
