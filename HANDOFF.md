# Home Hub — Handoff Document
Updated: 2026-06-17 (document expiry alerts)

## Current state: document expiry push alerts complete ✓

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
- Last commit: `6d1b2bc` (meal→shopping generator)
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
8. ✅ **Richer calendar** — DB migration 017 adds `end_date` + `color` to `calendar_events`. Multi-day events expand across date range. Per-event colour picker (8 swatches) in form. Week/agenda views show "d MMM – d MMM" range label. All views use event colour override.
9. ✅ **Meal plan → shopping list generator** — "Generar lista de la compra" button on `/menu` page.
10. ✅ **Realtime shopping list sync** — Supabase Realtime channel on `shopping_items` filtered by `household_id`; INSERT/UPDATE/DELETE handled in `ShoppingList` local state; card remounts on remote `is_completed` change.
11. ✅ **FAB buttons → inline** — All fixed-position floating add buttons converted to full-width inline buttons at bottom of content.
12. ✅ **Reminder delete removed** — Trash button removed from `ReminderCard`; only Documents retains delete.
13. ✅ **Stuck notification badge fixed** — `deleteReminder` now marks related `notification_events` as read, clearing the bell badge.
14. ✅ **Document expiry push alerts** — `scan_document_expiry_notifications()` SQL function + pg_cron job daily at 08:00 UTC. Queues `scheduled_notifications` for docs expiring in 30, 7, and 1 day. Deduplication via `idempotency_key`. Applied as migration 018.

## Next planned improvements (see NEXT_STEPS.md for full detail)
1. Realtime shopping list sync
3. Richer calendar (multi-day events, drag-to-reschedule)
4. Meal plan → shopping list generator
5. Realtime shopping list sync
6. Document expiry push alerts
7. Monthly budget tracker
8. Savings goal progress charts
