# Home Hub — Handoff Document
Updated: 2026-06-17 (v1 complete — all milestones done)

## Current state: v1 shipped ✓

All planned v1 milestones are complete and live in production.

## Production URL
https://home-hub-dun.vercel.app

## Last known good state
- Build, lint, typecheck all pass
- Last commits: `195b890` (UI/UX audit — touch targets + press states), `82af7d3` (UI/UX audit — animations/focus trap), `3b8972f` (reminder timezone fix)
- Deployed to Vercel production ✓
- Push notifications working end-to-end on real device ✓
- Reminder timezone bug corrected ✓

## Deploy command
```
npx vercel --prod
```
(GitHub-triggered deploys blocked on Hobby plan — always use CLI)

## Post-launch ideas (not blocking)
- Global search `/buscar` page — design-ready, deferred post-MVP
- Web font upgrade (Inter or Plus Jakarta Sans)
- Animated page transitions
- More granular push notification scheduling
- Dedicated `/papelera` route for all modules
