# Home Hub — Handoff Document
Updated: 2026-06-17 (post-launch polish — papelera done)

## Current state: post-launch polish in progress

v1 is live. Working through post-launch improvements in order.

## Production URL
https://home-hub-dun.vercel.app

## Deploy command
```
npx vercel --prod
```
(GitHub-triggered deploys blocked on Hobby plan — always use CLI)

## Last known good state
- Build, lint, typecheck all pass
- Last commit: `9d04dd2` (/papelera recovery route)
- Pushed to origin main ✓
- Deploy pending for this commit

## Completed post-launch items
1. ✅ **Web font upgrade** — Plus Jakarta Sans via `next/font/google`
2. ✅ **Animated page transitions** — fade-up 220ms on every route change
3. ✅ **Global search `/buscar`** — 9 modules, search icon in top bar
4. ✅ **`/papelera` recovery route**
   - `app/(app)/papelera/page.tsx`: server component, queries 7 modules in parallel
   - Uses existing `TrashSection` component + all existing restore actions (no new actions needed)
   - Modules covered: reminders, documents, fixed_payments, expenses, savings_goals, subscriptions, shopping_lists
   - Empty state when nothing deleted; collapsed accordions per module otherwise
   - Accessible from Menu sheet (Menú button in top bar) — added to `MENU_ITEMS` in `lib/constants.ts`

## Remaining post-launch items (in order)
5. Push notification quiet hours / per-category toggles
