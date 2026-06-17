# Home Hub — Handoff Document
Updated: 2026-06-17 (dark mode added)

## Current state: dark mode complete ✓

System-aware dark mode added. App follows iOS/Android/macOS system setting automatically.

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
- Last commit: `96b516e` (dark mode)
- Pushed to origin main ✓
- Deploy pending (app only; Edge Function unchanged)

## Completed improvements (chronological)
1. ✅ **Web font** — Plus Jakarta Sans via `next/font/google`
2. ✅ **Page transitions** — fade-up 220ms via `PageTransition` wrapper
3. ✅ **Global search `/buscar`** — 9 modules, search icon in top bar
4. ✅ **`/papelera` recovery route** — 7 modules, linked from Menu sheet
5. ✅ **Push notification quiet hours** — toggle + time pickers in settings; Edge Function enforces window
6. ✅ **Dark mode** — `@media (prefers-color-scheme: dark)` in `globals.css`; remaps surface/text/border/shadow tokens; one `bg-white→bg-card` fix in `InstallGuideView.tsx`

## Next planned improvements (see NEXT_STEPS.md for full detail)
1. Expense analytics charts
3. Richer calendar (multi-day events, drag-to-reschedule)
4. Meal plan → shopping list generator
5. Realtime shopping list sync
6. Document expiry push alerts
7. Monthly budget tracker
8. Savings goal progress charts
