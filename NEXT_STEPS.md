# Next Steps

## IMMEDIATE: Fix Vercel deployment (BLOCKED)

The app redesign (UI-1 through UI-8) is complete and pushed to GitHub but NOT live yet.
All Vercel deployments are BLOCKED. The new UI is NOT visible at https://home-hub-dun.vercel.app

### Root cause
Vercel Hobby Plan does not support collaboration on private repos. The GitHub commit author
(`Andrew-Halls`) is not the Vercel project owner, so GitHub-triggered deployments are blocked.
Do NOT make the repo public (CLAUDE.md forbids it).

### Fix: deploy via Vercel CLI (no plan upgrade needed)

`npm install -g vercel` failed with a permissions error (cannot write to global node_modules).

Use `npx` instead — it does not require global install permissions:

```
! npx vercel --prod
```

Run this from `/Users/dianezhalls/Projects/home-hub`. It will prompt to log in to Vercel and
link the project on the first run. Once it completes, the redesign goes live immediately.

After a successful deploy, update HANDOFF.md to confirm the app is live.

---

## Phase: UI/UX Redesign — COMPLETE

All functional milestones (1–22) and all UI milestones (UI-0 through UI-8) are complete.

---

## Complete: UI-0 through UI-8

- [x] UI-0: Audit and plan
- [x] UI-1: Design system tokens, shared components (WeekStrip, SegmentedControl, MetricCard, Card variants, EmptyState, Button sizes)
- [x] UI-2: Navigation redesign (Calendario promoted to primary; MoreMenuSheet bottom sheet)
- [x] UI-3: Dashboard redesign (GreetingCard, 6 MetricCards, WeekCalendarWidget, conditional ListSections)
- [x] UI-4: Finance redesign (SegmentedControl tabs, KPI chip grid in ResumenTab)
- [x] UI-5: Calendar redesign (week-first default, WeekStrip + day panel, Agenda view, SegmentedControl)
- [x] UI-6: Module polish (skeleton PageLoader, ReminderList SegmentedControl filter, ModuleError + error.tsx for all routes)
- [x] UI-7: Tablet/iPad responsive (AppShell max-w-3xl cap, TopBar h1 hidden on md+, dashboard 2-col on lg+)
- [x] UI-8: QA + final polish (Spanish copy audit clean, finance EmptyState icons, dynamic ShoppingListForm placeholder)

---

## Post-launch ideas (not milestones)

- Global search `/buscar` page — design-ready, deferred post-MVP
- Web font upgrade (Inter or Plus Jakarta Sans)
- Animated page transitions
- More granular push notification scheduling
