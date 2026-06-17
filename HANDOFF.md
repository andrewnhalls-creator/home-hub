# Home Hub — Handoff Document
Updated: 2026-06-17 (Milestone 19 complete)

## Current milestone: 20 — PWA (manifest, icons, install prompt)

## Status
- Milestone 19 (Offline support for shopping): COMPLETE — committed and pushed

## What was done in Milestone 19
- **`hooks/useOnlineStatus.ts`**: React hook using `window.addEventListener("online"/"offline")` to track connectivity
- **`hooks/useOfflineToggleQueue.ts`**: Queues `toggleShoppingItemComplete` calls in `localStorage` when offline; drains queue and calls `router.refresh()` when back online
- **`components/ui/OfflineBanner.tsx`**: "Sin conexión — los cambios se sincronizarán al reconectarte" amber banner shown app-wide when offline
- **`components/layout/AppShell.tsx`**: Added `<OfflineBanner />` between TopBar and main content
- **`components/shopping/ShoppingItemCard.tsx`**: Toggle now uses local optimistic state (`localCompleted`); checks `isOnline` — if offline, enqueues and updates local UI; if online, calls server action normally
- **`public/sw.js`**: Added install/activate lifecycle, cache-first for `/_next/static/` assets, network-first with cache fallback for `/compra` routes (page shell)

## Already done
- Milestone 18: Loading states, success toasts, noValidate
- Milestone 17: Activity log + TrashSection restore UI
- Milestone 16: Settings pages, forgot/reset password, auth callback
- All modules: aria-labels, delete confirm modals, EmptyState, Zod validation, Spanish errors

## Last known good state
- Build, lint, typecheck all pass
- Committed and pushed as "Add offline support for shopping list (Milestone 19)"
