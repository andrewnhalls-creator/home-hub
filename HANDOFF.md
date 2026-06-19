# Home Hub — Handoff Document
Updated: 2026-06-19 (Stage 1 sync/realtime/UI bug fixes — committed and pushed)

## Current state
Build passes, lint clean (0 errors, warnings only), typecheck clean. All changes committed and pushed.

## What changed this session

### Stage 1 — Sync / realtime / UI bug fixes

**1a — Home KPI cards desync (fixed)**
- **Root cause:** Finance server actions only called `revalidatePath("/finanzas")`, so the `/dashboard` page cache was never invalidated when payments/subscriptions changed.
- **Fix:** Added `revalidatePath("/dashboard")` to all finance actions that affect dashboard KPI cards: `createFixedPayment`, `updateFixedPayment`, `deleteFixedPayment`, `restoreFixedPayment`, `markPaymentInstancePaid`, `skipPaymentInstance`, `createSubscription`, `deleteSubscription`, `restoreSubscription`, `updateSubscription`.
- **File:** `app/(app)/finanzas/actions.ts`

**1b — Shopping list not updating live (fixed)**
- **Root cause:** `ShoppingList` initialised `localItems` from the `items` prop via `useState(items)` but never re-synced when the prop changed. When `router.refresh()` fired (from RealtimeSync or post-action revalidation), the new server-fetched `items` was ignored by the component.
- **Fix:** Added derived-state pattern (`prevItems` / `setPrevItems`) that syncs `localItems` from `items` prop whenever it changes, using the same render-time pattern already used for `quickState` in the same file. The existing Supabase realtime channel still handles granular in-place updates as primary; this is a reliable fallback.
- **File:** `components/shopping/ShoppingList.tsx`

**1c — AI assistant button blur (fixed)**
- **Root cause:** `Toast.tsx` had `backdropFilter: blur(8px)` — a content surface, violating the two-tier glass rule (blur only on nav bars and modals/sheets). The toast container sits at `fixed bottom-20 z-50`, co-located with the AI chat FAB at `z-40`. The toast's blur was bleeding onto the button beneath it.
- **Fix:** Removed `backdropFilter`/`WebkitBackdropFilter` from the individual toast `div`. Toast background colour and border are sufficient for legibility on the dark background.
- **Sweep result:** Only Toast was wrong. All other `backdropFilter` uses are legitimate (BottomNav, TopBar, Sidebar = nav bars; Modal, MoreMenuSheet = modal sheets).
- **File:** `components/ui/Toast.tsx`

## Design identity (Índigo Profundo · Dark-first · Two-tier glass)
- **Background:** deep indigo `#0D0B1F`
- **Brand accent:** saffron gold `#E8C547` (`--color-terracotta`)
- **Two-tier glass rule:** blur only on nav bars and modals/sheets — now clean across the whole app
- **Icons:** Phosphor Icons v2 only
- **Canonical design doc:** `DESIGN.md`

## Production URL
https://home-hub-dun.vercel.app

## Last committed state
- Commit: `c51a0ff` — Stage 1: Fix KPI desync, shopping list sync, AI button blur

## SQL migrations applied
- 001–029 (full schema + finance cycle + income + subscriptions + category budgets + data fixes + shopping list source week)

## Edge Function + pg_cron
- `send-push` v8 deployed; `send-push-cron` (every min) + `document-expiry-scan` (08:00 UTC daily)
