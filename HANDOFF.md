# Home Hub — Handoff Document
Updated: 2026-06-17 (UI/UX + animation polish)

## Current state: UI/UX and animation polish complete ✓

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
- Last commit: `f055167` (animation polish — sliding tabs, backdrop fades, stagger, scaleX progress)
- Pushed to origin main ✓
- Deploy pending (run `npx vercel --prod` to deploy)
- Edge Function unchanged (no redeploy needed)

## Completed improvements (chronological)
1. ✅ **Web font** — Plus Jakarta Sans via `next/font/google`
2. ✅ **Page transitions** — fade-up 220ms via `PageTransition` wrapper
3. ✅ **Global search `/buscar`** — 9 modules, search icon in top bar
4. ✅ **`/papelera` recovery route** — 7 modules, linked from Menu sheet
5. ✅ **Push notification quiet hours** — toggle + time pickers in settings; Edge Function enforces window
6. ✅ **Dark mode** — `@media (prefers-color-scheme: dark)` in `globals.css`; remaps surface/text/border/shadow tokens
7. ✅ **Expense analytics charts** — `ExpenseCharts.tsx` with recharts: monthly bar (6mo), weekly bar (4wk), category donut (current month)
8. ✅ **Richer calendar** — migration 017 adds `end_date` + `color` to `calendar_events`. Multi-day events, per-event colour picker (8 swatches)
9. ✅ **Meal plan → shopping list generator** — "Generar lista de la compra" button on `/menu` page
10. ✅ **Realtime shopping list sync** — Supabase Realtime channel on `shopping_items`; granular INSERT/UPDATE/DELETE updates in `ShoppingList` local state
11. ✅ **FAB buttons → inline** — All fixed-position floating add buttons converted to full-width inline buttons
12. ✅ **Reminder delete removed** — Trash button removed from `ReminderCard`; only Documents retains delete
13. ✅ **Stuck notification badge fixed** — `deleteReminder` marks related `notification_events` as read
14. ✅ **Document expiry push alerts** — `scan_document_expiry_notifications()` SQL function + pg_cron daily at 08:00 UTC. Migration 018. 30/7/1 day alerts, deduplication via `idempotency_key`
15. ✅ **Monthly budget tracker** — `monthly_budget` on `households` (migration 019). `BudgetCard`: progress bar green→amber→red, inline edit. Tracks variable expenses vs budget
16. ✅ **Global realtime sync** — `RealtimeSync` component in AppShell watches 14 tables via one Supabase Realtime channel, debounces `router.refresh()` (200ms). Every page updates live across all devices in the household
17. ✅ **Interaction + animation polish (pass 1)** — `transition-colors` → `transition` on Button so `active:scale` eases back; toast entry animation; sheet-enter now fades in; page transition tightened to 180ms with strong cubic-bezier; `active:scale` press feedback added to every icon button across all modules; `focus-visible:ring` added to all icon-only action buttons; unread notification `border-l-4` replaced with `bg-terracotta/8` tint; TopBar "Menu" → "Más"
18. ✅ **Animation system (pass 2)** — Sliding `SegmentedControl` indicator pill (useLayoutEffect, no flash); tab content fade via `key={tab} animate-tab-enter`; Modal + MoreMenuSheet backdrops fade in; all progress bars switched from `width%` to GPU-composited `transform:scaleX` with `@starting-style` 0→value on mount; list stagger (8-item cascade) on dashboard ListSection and shopping items; `FinanceTabs` mobile grid buttons get `active:scale-[0.97]`

## SQL migrations applied
- 001–017: initial schema through calendar multi-day/colour
- 018: `scan_document_expiry_notifications()` function + pg_cron job (jobid 2)
- 019: `monthly_budget` column on `households`

## pg_cron jobs
- jobid 1: `send-push-cron` — every minute, processes pending `scheduled_notifications`
- jobid 2: `document-expiry-scan` — daily 08:00 UTC, calls `scan_document_expiry_notifications()`
