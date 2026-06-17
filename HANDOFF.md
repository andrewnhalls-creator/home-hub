# Home Hub — Handoff Document
Updated: 2026-06-17 (post-launch polish — global search done)

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
- Last commit: `3a573de` (global search)
- Pushed to origin main ✓
- Deploy pending for this commit

## Completed post-launch items
1. ✅ **Web font upgrade** — Plus Jakarta Sans via `next/font/google`
2. ✅ **Animated page transitions** — fade-up 220ms on every route change via `PageTransition`
3. ✅ **Global search `/buscar`**
   - `app/(app)/buscar/page.tsx`: server component, reads `?q=`, queries 9 tables in parallel
   - `components/search/SearchView.tsx`: client component, form input + grouped results
   - `components/layout/TopBar.tsx`: search icon (🔍) added, links to `/buscar`
   - Searches: shopping_items, reminders, chores, fixed_payments, subscriptions,
     household_documents, wishlist_items, recipes, savings_goals
   - Soft-delete filters applied where relevant (reminders, fixed_payments, subscriptions,
     household_documents, savings_goals)
   - Results grouped by module with icon headers; each row links to that module's page
     (recipes link directly to `/menu/recetas/{id}`)
   - Empty state for <2 chars; zero-results state with copy

## Remaining post-launch items (in order)
4. `/papelera` recovery route
5. Push notification quiet hours / per-category toggles
