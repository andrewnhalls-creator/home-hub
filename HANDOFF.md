# Home Hub — Handoff Document
Updated: 2026-06-17 (expense charts added)

## Current state: expense analytics charts complete ✓

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
- Last commit: `68a9f43` (expense charts)
- Pushed to origin main ✓
- Deploy pending (app only; Edge Function unchanged)

## Completed improvements (chronological)
1. ✅ **Web font** — Plus Jakarta Sans via `next/font/google`
2. ✅ **Page transitions** — fade-up 220ms via `PageTransition` wrapper
3. ✅ **Global search `/buscar`** — 9 modules, search icon in top bar
4. ✅ **`/papelera` recovery route** — 7 modules, linked from Menu sheet
5. ✅ **Push notification quiet hours** — toggle + time pickers in settings; Edge Function enforces window
6. ✅ **Dark mode** — `@media (prefers-color-scheme: dark)` in `globals.css`; remaps surface/text/border/shadow tokens; one `bg-white→bg-card` fix in `InstallGuideView.tsx`
7. ✅ **Expense analytics charts** — `ExpenseCharts.tsx` with recharts: monthly bar (6mo), weekly bar (4wk), category donut (current month). Rendered above expense list in Gastos tab.

## Next planned improvements (see NEXT_STEPS.md for full detail)
1. Richer calendar (multi-day events, drag-to-reschedule)
3. Richer calendar (multi-day events, drag-to-reschedule)
4. Meal plan → shopping list generator
5. Realtime shopping list sync
6. Document expiry push alerts
7. Monthly budget tracker
8. Savings goal progress charts
