# Home Hub — Handoff Document
Updated: 2026-06-17 (Milestone 22 automated checks complete)

## Current milestone: 22 — Final review (manual tests pending)

## Status
- Milestone 22 automated checks: COMPLETE
- Milestone 22 manual tests: PENDING (requires real device + browser)

## What was verified in Milestone 22 (automated)
- UI text audit: all rendered strings are Spanish (Spain). Only "Home Hub" brand name is English — correct.
- Secrets scan: no secrets committed in any file or git history. `.env.local`, `.env`, `.claude/` are gitignored.
- Edge Function reads VAPID/service-role keys from Deno.env only — never hardcoded.
- RLS: 28 tables have RLS enabled. All household-scoped policies use `is_household_member()`.
- `npm run lint` → clean (zero warnings/errors)
- `npm run typecheck` → clean (zero errors)

## Production URL
https://home-hub-dun.vercel.app

## Manual tests still required (Milestone 22)
See NEXT_STEPS.md for the full checklist. Key items:
1. Smoke-test every module CRUD at the live URL
2. Push notification end-to-end on a real device (subscribe at /ajustes/notificaciones, verify delivery)
3. RLS cross-household: two separate user accounts should not see each other's data
4. Mobile usability at 375px and PWA install flow at /ajustes/instalar

## Already done (full history)
- Milestone 21: Vercel deployment live
- Milestone 20: PWA manifest, icons, install guidance
- Milestone 19: Offline support for shopping
- Milestone 18: Loading states, toasts, noValidate
- Milestone 17: Activity log + trash/restore UI
- Milestone 16: Settings, forgot/reset password
- All modules: Spanish UI, RLS, Zod validation, empty/loading/error states

## Last known good state
- Build, lint, typecheck all pass locally and on Vercel
- No uncommitted changes
