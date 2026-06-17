# Next Steps

## Phase: UI/UX Redesign — "Warm Home Cockpit"

All functional milestones (1–22) are complete. The app is live at https://home-hub-dun.vercel.app.
The next phase is a full UI/UX redesign. See `UI_REDESIGN_PLAN.md` for the full audit and plan.

---

## Current: Milestone UI-0 — COMPLETE

- [x] UI audit: identified all problem areas
- [x] `UI_REDESIGN_PLAN.md` created
- [x] `DESIGN_SYSTEM.md` updated with shadow tokens, radius tokens, new components
- [x] `NEXT_STEPS.md` updated
- [x] `HANDOFF.md` updated

---

## Next: Milestone UI-1 — Design system foundation

**Goal:** Create shared design tokens and polish reusable UI components. No page-level changes yet.

**Files to touch:**
- `app/globals.css` — add shadow/radius CSS tokens
- `components/ui/Card.tsx` — add variant prop (default, featured, subtle, metric)
- `components/ui/EmptyState.tsx` — improve icon area, spacing, copy treatment
- `components/ui/Button.tsx` — verify sizes, confirm lg size for FABs
- `components/ui/WeekStrip.tsx` — NEW: shared week row component
- `components/ui/SegmentedControl.tsx` — NEW: pill tab selector for Finance + Calendar
- `components/ui/MetricCard.tsx` — NEW: dashboard metric tile

**Checks:** `npm run lint`, `npm run typecheck`, `npm run build`

---

## Milestone UI-2 — Navigation + app shell

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
