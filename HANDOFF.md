# Home Hub — Handoff Document
Updated: 2026-06-17 (Granito design identity + glass palette)

## Current state: Design identity established, glass palette applied ✓

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
- Last commit: `c8d4102` (glass consistency sweep — P1 fixes + token cleanup)
- Pushed to origin main ✓
- Deploy pending (run `npx vercel --prod` to deploy)
- Edge Function unchanged (no redeploy needed)

## Design identity (new this session)
- **PRODUCT.md** and **DESIGN.md** written — register, brand personality, anti-references, full visual system
- **Palette: "Granito"** — dark-first: warm charcoal bg (`oklch(0.17 0.010 62)`), glass card surfaces (`oklch(1 0 0 / 0.08)` + `backdrop-blur-xl`), terracotta primary (`oklch(0.58 0.130 32)`, clay-red not orange), wood-brown accent
- **Dark-first**: `:root` is dark; `@media (prefers-color-scheme: light)` overrides to warm stone. `color-scheme: dark light`
- **Glass applied to**: Card (all variants), BottomNav, TopBar, Modal, GreetingCard
- **Button**: raised tile shadow (top glaze highlight + bottom edge + drop), `translateY(1px)` on press
- **themeColor**: `#1e1b14` (dark charcoal, matches app bg)
- **Critique run**: score 26/40. P0 fixed (modal backdrop). P1s fixed (modal blur, GreetingCard glass). Remaining: P2 `/impeccable onboard` for help/tooltips score (1/4)
- **Critique snapshot**: `.impeccable/critique/2026-06-17T21-21-46Z__app.md`

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
