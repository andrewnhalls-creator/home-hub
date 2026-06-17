# Home Hub — Handoff Document
Updated: 2026-06-17 (Web Interface Guidelines pass — build clean, deployed)

## Current milestone: DEPLOYED + ACCESSIBILITY PASS ✓

## Status
All functional milestones (1–22) complete. Full UI/UX redesign (UI-0 through UI-8) complete.
Web Interface Guidelines audit done — 8 fixes applied and deployed. No outstanding milestones.
Deployed via Vercel CLI (`npx vercel --prod`) — GitHub-triggered deploys remain blocked on Hobby plan
(collaborator restriction), so use CLI for future deploys.

## Last session: Web Interface Guidelines fixes (2026-06-17)
- `globals.css`: added `color-scheme: light` and `prefers-reduced-motion: reduce` rule
- `PageLoader`: `animate-pulse` → `motion-safe:animate-pulse`
- `Toast`: error variant uses `role="alert"` (assertive); dismiss button gets `focus-visible:ring`
- `Input`: `focus:` → `focus-visible:` so ring only appears on keyboard focus
- `Modal`: added `overscroll-contain` on scrollable dialog
- `WeekStrip`: `tabIndex={-1}` on non-interactive day buttons
- `MetricCard`: `tabular-nums` on metric value
- Build, lint, typecheck all pass. Deployed successfully.

## Production URL
https://home-hub-dun.vercel.app

## What was done in Milestone UI-8
- Spanish copy audit: all user-facing strings confirmed Spanish (es-ES); no English UI text found across components and app pages
- Finance `EmptyState` icons: added `ShoppingBag` (Gastos), `CalendarClock` (Pagos fijos), `PiggyBank` (Ahorro), `RefreshCcw` (Suscripciones) — all four finance tabs now consistent with other modules
- `ShoppingListForm`: placeholder date is now dynamic (current week's Monday) instead of stale hardcoded `"16/06"`
- Verified: all Zod validation messages are Spanish; all `aria-label` values are Spanish; all toast messages are Spanish
- Verified: loading states (skeleton shimmer via `PageLoader`), error states (`ModuleError` with retry), empty states (`EmptyState` with icon) all present and consistent across modules

## What was done in Milestone UI-7
- `components/layout/AppShell.tsx`: main content wrapped in `max-w-3xl mx-auto` — caps at 768px on large screens, centered on desktop
- `components/layout/TopBar.tsx`: page `h1` hidden on `md:` (sidebar active item serves that role); household name now shows on `md:` instead of `sm:`; right section uses `flex-1 justify-end` for clean alignment
- `app/(app)/dashboard/page.tsx`: metric grid → `grid-cols-2 md:grid-cols-3 lg:grid-cols-2`; on `lg:`, two-column layout with metrics on left and calendar widget + list sections on right
- Trash section wrappers in recordatorios, documentos, compra/listas, finanzas: removed redundant `px-4` (AppShell already provides horizontal padding)

## What was done in Milestone UI-6
- `components/ui/PageLoader.tsx`: upgraded from spinner to skeleton card shimmer (4 shimmer cards with avatar + two text lines); affects all 14 module loading states
- `components/reminders/ReminderList.tsx`: replaced raw pill `<button>` filter row with `SegmentedControl scrollable` (Hoy / Semana / Todos / Completados); consistent with Calendar and Finance tab selectors
- `components/ui/ModuleError.tsx` (new): shared error state — AlertTriangle icon in danger circle, "Algo ha ido mal" message, "Reintentar" secondary button
- `app/(app)/*/error.tsx` (new, 10 files): error boundaries for dashboard, calendario, compra, deseos, documentos, finanzas, menu, recordatorios, tareas, ajustes — all delegate to `ModuleError`

## What was done in Milestone UI-5
- `components/calendar/CalendarView.tsx`: full redesign
  - Default view changed `"mensual"` → `"semanal"`
  - `ViewMode` renamed `"proximos"` → `"agenda"`
  - View selector: replaced raw pill buttons with `SegmentedControl` (Semana / Mes / Agenda)
  - Added `selectedWeekDay` state (defaults to today); `effectiveWeekDay` clamps to visible week
  - New week view: `WeekStrip` with event dots + selected-day panel below (title + typed item list); replaces the 7-card-per-day layout
  - `navWeek()` helper updates both cursor and selectedWeekDay together
  - Agenda view: replaced plain `Card` list with date-tile (terracotta mini calendar chip) + title + type label
  - Month day label in modal uses full "EEEE d de MMMM" format
  - `TYPE_LABEL` map added for Spanish type labels in item rows
  - `weekEventDates` memo derives date range internally from `cursor` to satisfy React Compiler

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
