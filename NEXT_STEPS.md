# Next Steps

## Phase: UI/UX Redesign — "Warm Home Cockpit"

All functional milestones (1–22) are complete. The app is live at https://home-hub-dun.vercel.app.
The next phase is a full UI/UX redesign. See `UI_REDESIGN_PLAN.md` for the full audit and plan.

---

## Complete: Milestone UI-0 through UI-7

- [x] UI-0 through UI-6: see HANDOFF.md
- [x] UI-7: AppShell max-w-3xl content cap; TopBar h1 hidden on desktop; dashboard 2-col on lg+; trash section double-padding fixed

---

## Next: Milestone UI-8 — QA + final polish

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

## Milestone UI-8 — QA + final polish

**Goal:** Lint, typecheck, build all pass (already do). Mobile viewport check at ~375px for all modules. Spanish copy audit — scan all visible strings. Fix any issues found.

**Key checks:**
- All module pages render correctly at 375px width
- No English strings in user-facing UI
- All loading/error/empty states look right
- TopBar, BottomNav, Sidebar all consistent
