# Next Steps — Fresh Session Checklist

## Start Here
1. Read `HANDOFF.md` (full document)
2. Read `CLAUDE.md`
3. Run `git status --short` and `git log --oneline -5`

> **Session discipline:** Work one stage at a time. Stop and ask the user to start a fresh Claude Code session if context is getting large. After every completed stage, update `HANDOFF.md`, `NEXT_STEPS.md`, commit, push, and wait for "continue".

## Current Position
**Milestone 16 — Settings expansion**

Milestone 15 complete. End-to-end push notification device test deferred to Milestone 22 (requires real user accounts).

## Immediate Next Task

### Milestone 16 — Settings expansion
Per BUILD_PLAN.md:
- `/ajustes/dispositivos` — device/session list, revoke/remove device, tied to push_subscriptions deactivation
- `/ajustes/categorias` — create/rename/recolour/archive categories per module; never hard-delete a category in use
- `/ajustes/privacidad` — export household data as JSON, finance/shopping-history/documents as CSV
- `/auth` — forgot/reset password, change password, change email

## After Milestone 15
Continue in order per BUILD_PLAN.md:
- Milestone 16: Settings expansion (`/ajustes/dispositivos`, `/categorias`, `/privacidad`, password reset)
- Milestone 17: Activity log + trash/archive UI
- Milestone 18: Polish
- Milestone 19: Offline shopping
- Milestone 20: PWA + install prompt
- Milestone 21: Deploy to Vercel — **ASK USER BEFORE DOING ANYTHING**
- Milestone 22: Final review

## VAPID Key Status
- Public key: in `.env.local` as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` ✅
- Private key: NOT committed. User holds it. Set as Edge Function secret `VAPID_PRIVATE_KEY` in step 6.

## Do NOT
- Deploy Edge Function without asking
- Set Supabase secrets without asking
- Configure Supabase Cron without asking
- Re-apply any database migrations (001–013 are done)
- Recreate any existing routes or components
- Commit `.env`, `.env.local`, secrets, `*.rtf`, or service-role keys
- Force-push
- Deploy to Vercel without asking
- Make destructive DB changes without asking
