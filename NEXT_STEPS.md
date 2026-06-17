# Next Steps

## Phase: UI/UX Redesign — "Warm Home Cockpit"

All functional milestones (1–22) are complete. The app is live at https://home-hub-dun.vercel.app.
The next phase is a full UI/UX redesign. See `UI_REDESIGN_PLAN.md` for the full audit and plan.

---

## Complete: Milestone UI-0, UI-1, UI-2

- [x] UI-0: audit, `UI_REDESIGN_PLAN.md`, `DESIGN_SYSTEM.md` updated
- [x] UI-1: shadow/radius tokens; Card variants; Button size; EmptyState polish; WeekStrip, SegmentedControl, MetricCard
- [x] UI-2: new primary nav (Inicio/Calendario/Compra/Finanzas/Más); MoreMenuSheet with 3-col grid + accents; Sidebar separator + icon polish

---

## Next: Milestone UI-3 — Dashboard redesign

**Goal:** New bottom nav order (Inicio, Calendario, Compra, Finanzas, Más). Más becomes a polished sheet.

**Files:** `lib/constants.ts`, `components/layout/BottomNav.tsx`, `components/layout/MoreMenuSheet.tsx`, `components/layout/Sidebar.tsx`

---

## Milestone UI-3 — Dashboard redesign

**Goal:** Redesign /dashboard as home cockpit with greeting card, 6 metric tiles, week calendar widget, and upcoming sections.

**Files:** `app/(app)/dashboard/page.tsx`, new dashboard components

---

## Milestone UI-4 — Finance redesign

**Goal:** Fix mobile layout, use SegmentedControl for tabs, improve KPI card grid.

**Files:** `components/finance/FinanceTabs.tsx`, `components/finance/ResumenTab.tsx`, `app/(app)/finanzas/page.tsx`

---

## Milestone UI-5 — Calendar redesign

**Goal:** Default to weekly view, add WeekStrip, rename Agenda view, improve week day layout.

**Files:** `components/calendar/CalendarView.tsx`

---

## Milestone UI-6 — Module polish

**Goal:** Consistent headers, empty/loading/error states, card styles across all modules.

---

## Milestone UI-7 — Tablet/iPad responsive

**Goal:** Dashboard 2-col grid, sidebar on md+, split layout for Calendar/Finance where feasible.

---

## Milestone UI-8 — QA + final polish

**Goal:** Lint, typecheck, build, mobile/tablet viewport checks, Spanish copy audit.
