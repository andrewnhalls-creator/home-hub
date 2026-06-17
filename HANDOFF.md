# Home Hub — Handoff Document
Updated: 2026-06-17 (Milestone UI-4 complete)

## Current milestone: UI-4 — Finance redesign (COMPLETE)

## Status
All functional milestones (1–22) complete. UI-0 through UI-4 done.
Next is UI-5 (Calendar redesign).

## Production URL
https://home-hub-dun.vercel.app

## What was done in Milestone UI-4
- `app/globals.css`: added `.scrollbar-none` utility (scrollbar-width: none + webkit)
- `components/ui/SegmentedControl.tsx`: added `scrollable` prop — when true, wraps in `overflow-x-auto` container and uses `shrink-0` items instead of `flex-1`; role/aria attributes split correctly between outer wrapper and inner tablist
- `components/finance/ResumenTab.tsx`: replaced 7 separate cards with a 3×2 KPI chip grid (no icons, pure numbers; danger color only for overdue > 0) + a subtle secondary card with "total pagos fijos" and "suscripciones" totals as key-value rows
- `components/finance/FinanceTabs.tsx`: uses `SegmentedControl scrollable`; compact labels ("Pagos" not "Pagos fijos"); month label context line above tabs; "Archivo" removed from tab strip (trash remains below in page)

## What was done in Milestone UI-3
- `components/dashboard/GreetingCard.tsx` (new): warm sand card with decorative terracotta circles, greeting + household name + pending status dot (green = clear, amber = items pending)
- `components/dashboard/WeekCalendarWidget.tsx` (new, client): WeekStrip with event dots + up to 3 upcoming events in a date-tile list + "Ver todo / Añadir evento" CTAs
- `components/dashboard/ListSection.tsx`: items now use `divide-y divide-border` with `py-2.5` rows; "Ver todo" gets ChevronRight icon; `emptyMessage` is now optional; `min-w-0 truncate` on item titles
- `app/(app)/dashboard/page.tsx`: full restructure — 7 parallel queries (removed savings/activity, added calendar events, subscriptions window 30→7 days, reminders/chores/payments now return count+data in one call); 6 MetricCards in 2-col grid; WeekCalendarWidget; ListSections only rendered when they have data; no more RecentActivity or savings goal card on dashboard

## What was done in Milestone UI-2
- `lib/constants.ts`: `NAV_ITEMS` reordered (Inicio, Calendario, Compra, Finanzas first); `PRIMARY_NAV_ITEMS` updated to the new 4 (Calendario replaces Menú); `MORE_NAV_ITEMS` now: Recordatorios, Tareas, Menú, Documentos, Deseos, Ajustes
- `components/layout/MoreMenuSheet.tsx` (new): dedicated bottom sheet with handle bar, backdrop, 3-col grid of tiles with per-module accent icon colors; uses `createPortal`; Escape key + backdrop click close
- `components/layout/BottomNav.tsx`: uses `MoreMenuSheet` instead of generic Modal; active icon scales up; `aria-expanded` on Más button
- `components/layout/Sidebar.tsx`: separator before Ajustes; icon colored terracotta on active; subtle hover states

## What was done in Milestone UI-1
- `app/globals.css`: added warm shadow tokens (`--shadow-card`, `--shadow-card-hover`, `--shadow-modal`) and radius tokens (`--radius-sm/md/lg/xl/full`) to `:root` + exposed shadow tokens in `@theme inline` as Tailwind utilities
- `components/ui/Card.tsx`: added `variant` prop (`default`, `featured`, `subtle`, `metric`) with warm shadows
- `components/ui/Button.tsx`: added `size` prop (`sm`, `md`, `lg`) for FAB support; `md` remains the default (44px tap target)
- `components/ui/EmptyState.tsx`: polished icon container (14×14→7 icon), title made `font-semibold`, description `leading-relaxed`, added `className` prop
- `components/ui/WeekStrip.tsx`: NEW — Mon–Sun strip, today highlight (terracotta circle), selected state, event dots, weekend tint, accessible labels in Spanish
- `components/ui/SegmentedControl.tsx`: NEW — pill tab selector, active tab gets card background + shadow, generic typed API
- `components/ui/MetricCard.tsx`: NEW — icon + large metric + label + optional status line + deep-link via Next.js `<Link>`

## Last known good state
- Build, lint, typecheck all pass
- No uncommitted changes (before this session)
- Supabase + Vercel live and healthy

## Previously done (full history)
- Milestones 1–22: full functional app, Spanish UI, RLS, Zod validation, push notifications, PWA, offline shopping, activity log, trash/restore, settings, deployment
