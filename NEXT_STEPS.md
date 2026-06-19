# Next Steps

## Current state
All previous tasks complete. Starting iPad Pro layout milestone.

---

## iPad Pro layout milestone — COMPLETE ✅

### Goal
The app already has a sidebar + hidden BottomNav on `md:` (768px+). The gaps are:
1. **Content container too narrow** — `max-w-3xl` (768px) in AppShell wastes width on iPad Pro 12.9" landscape (~1100px available after sidebar)
2. **Module pages are single-column** — need two-column grids on `lg:` for key modules

### Files to change

**1. `components/layout/AppShell.tsx`** — widen content container ✅ DONE
- Changed `max-w-3xl` → `max-w-3xl lg:max-w-5xl`

**2. `app/(app)/dashboard/page.tsx`** — already has `lg:grid-cols-2` on lower section (line 151); check MetricGrid and upper section
- MetricGrid may need `xl:grid-cols-3` or similar
- WeekCalendarWidget + upcoming sections: consider side-by-side on `lg:`

**3. `app/(app)/finanzas/page.tsx`** — currently single-column; add two-column on `lg:`
- KPI summary row + tab content side-by-side or wider grid

**4. `app/(app)/calendario/page.tsx`** — check if CalendarView benefits from wider container

**5. `components/finance/FinanceTabs.tsx`** — tab selector + content may need `lg:` layout adjustment

**6. Other module pages** — compra, recordatorios, tareas, documentos, deseos, menú: review each; most are list-based and look fine wider; just verify they don't stretch awkwardly

### Approach
- Mobile layout must not change — all changes are `lg:` or `xl:` only
- One commit per file group (AppShell first, then modules)
- Stop after each group to update HANDOFF + NEXT_STEPS + commit + push

### Fresh session continuation prompt

> I'm starting the iPad Pro layout milestone on Home Hub (Next.js + Supabase + Tailwind, dark glassmorphism). Read HANDOFF.md and NEXT_STEPS.md for full context. The app already has a sidebar that shows on md+ and BottomNav that hides on md+. The work is: (1) widen the AppShell content container from max-w-3xl to max-w-3xl lg:max-w-5xl, (2) add two-column lg: grid layouts to the dashboard, finanzas, and other module pages that need it. Mobile layout must not change — all additions are lg: or xl: only. Start with AppShell, stop after each file group to update HANDOFF + NEXT_STEPS and commit + push.
