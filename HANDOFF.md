# Home Hub — Handoff Document
Updated: 2026-06-17 (all post-launch items complete)

## Current state: post-launch polish complete ✓

All planned post-launch improvements are done and pushed.

## Production URL
https://home-hub-dun.vercel.app

## Deploy command
```
npx vercel --prod
```
(GitHub-triggered deploys blocked on Hobby plan — always use CLI)
After deploying app, also redeploy the Edge Function:
```
npx supabase functions deploy send-push
```

## Last known good state
- Build, lint, typecheck all pass
- Last commit: `3b966f1` (push notification quiet hours)
- Pushed to origin main ✓
- Deploy pending for app + Edge Function

## Completed post-launch items
1. ✅ **Web font** — Plus Jakarta Sans via `next/font/google`
2. ✅ **Page transitions** — fade-up 220ms via `PageTransition` wrapper
3. ✅ **Global search `/buscar`** — 9 modules, search icon in top bar
4. ✅ **`/papelera` recovery route** — 7 modules, linked from Menu sheet
5. ✅ **Push notification quiet hours**
   - `quiet_hours_start` / `quiet_hours_end` columns already existed in `notification_preferences`
   - `NotificationsSettings.tsx`: new "Horario silencioso" card — toggle + time pickers (De / Hasta)
   - `actions.ts`: `upsertNotificationPreferences` now saves both quiet hours fields
   - `send-push/index.ts`: `isInQuietHours()` checks current Europe/Madrid time against the range (handles midnight crossover); called from `isPushAllowed()` before category check

## Next planned improvements (see NEXT_STEPS.md for full detail)
1. Dark mode (follows system setting)
2. Expense analytics charts
3. Richer calendar (multi-day events, drag-to-reschedule)
4. Meal plan → shopping list generator
5. Realtime shopping list sync
6. Document expiry push alerts
7. Monthly budget tracker
8. Savings goal progress charts
