# Home Hub — Handoff Document
Updated: 2026-06-19 (Part B Shopping ⇄ Meal-planner toggle — committed and pushed)

## Current state
Build passes, lint clean (warnings only, no errors), typecheck clean. All changes committed.

## What changed this session

### Part B — Shopping ⇄ Meal-planner toggle

**B1 — `SegmentedToggle` UI primitive**
- **File:** `components/ui/SegmentedToggle.tsx` (new)
- Client component using `usePathname()` from Next.js
- Two Link-based tabs: "Lista" (→ `/compra`) and "Semana" (→ `/menu`)
- Active "Lista" segment: `bg-terracotta/20 text-terracotta` (gold)
- Active "Semana" segment: `bg-sage/20 text-sage` (teal)
- Container: `border border-white/10` — no backdrop-filter (content, not nav)
- `role="tablist"`, `aria-selected`, `focus-visible` ring, min 44px targets

**B2 — Toggle on Compra surface**
- **File:** `app/(app)/compra/page.tsx`
- `<SegmentedToggle />` at top of page content

**B3 — Toggle on Menú surface**
- **File:** `app/(app)/menu/page.tsx`
- `<SegmentedToggle />` at top of page content (above week nav)

**B4 — "Generar lista" promoted to primary gold**
- **File:** `components/meals/GenerateListButton.tsx`
- Was: `bg-sage/10 text-sage border border-sage` (secondary)
- Now: `bg-terracotta text-cream hover:bg-terracotta/90` (primary gold)

**B5 — `source_menu_week_start` schema + action**
- **File:** `sql/029_shopping_list_source_week.sql` (new migration, applied)
- Added `source_menu_week_start date` nullable column to `shopping_lists`
- **File:** `app/(app)/menu/actions.ts` — `generateShoppingListFromMealPlan` now sets this column
- **File:** `lib/types.ts` — `ShoppingList` interface updated

**B6 — Reverse link: list → meal-plan week**
- **File:** `components/shopping/ShoppingListDetail.tsx`
- If `list.source_menu_week_start` is non-null, a "Ver semana →" link appears top-right → `/menu?start=YYYY-MM-DD`
- Lists created before this change have `null` and show no link (safe rollout)

## Design identity (Índigo Profundo · Dark-first · Two-tier glass)
- **Background:** deep indigo `#0D0B1F`
- **Brand accent:** saffron gold `#E8C547` (`--color-terracotta`)
- **Two-tier glass rule:** blur only on nav bars and modals/sheets
- **Icons:** Phosphor Icons v2 only
- **Canonical design doc:** `DESIGN.md`

## Production URL
https://home-hub-dun.vercel.app

## Last committed state
- Commit: Part B toggle (to be pushed)

## SQL migrations applied
- 001–029 (full schema + finance cycle + income + subscriptions + category budgets + data fixes + shopping list source week)

## Edge Function + pg_cron
- `send-push` v8 deployed; `send-push-cron` (every min) + `document-expiry-scan` (08:00 UTC daily)
