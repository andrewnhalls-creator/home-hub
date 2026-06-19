# UI_REDESIGN_PLAN.md — Home Hub

## Status: COMPLETE — All milestones UI-0 through UI-8 shipped as of 2026-06-18

> This document is historical. The redesign is live at https://home-hub-dun.vercel.app.
> For the current design spec see `DESIGN.md`. For project state see `HANDOFF.md`.

---

## 1. Current state audit

### Navigation (current)

| Slot | Route | Label |
|---|---|---|
| Primary 1 | /dashboard | Inicio |
| Primary 2 | /compra | Compra |
| Primary 3 | /menu | Menú |
| Primary 4 | /finanzas | Finanzas |
| More | /recordatorios | Recordatorios |
| More | /tareas | Tareas |
| More | /calendario | Calendario |
| More | /documentos | Documentos |
| More | /deseos | Deseos |
| More | /ajustes | Ajustes |

**Problems:**
- Calendario is buried in "Más" — it should be a primary tab (users need it daily)
- Menú is less essential as primary nav than Calendario
- "Más" menu uses a generic Modal — functional but not polished (no bottom sheet feel)
- Active state is functional but the pill/icon treatment is minimal

### Dashboard (`app/(app)/dashboard/page.tsx`)

**Current structure:**
1. Greeting Card (`Hola, {firstName}` + household name)
2. 2-column grid: Compra count + Menú count (`SummaryCard`)
3. `ListSection`: Próximos recordatorios (up to 3, with badge)
4. `ListSection`: Tareas de casa pendientes (up to 3)
5. `ListSection`: Próximos pagos (up to 3)
6. `Card`: Objetivo de ahorro (1 goal with progress bar)
7. Conditional `ListSection`: Suscripciones que renuevan pronto
8. `RecentActivity` (last 5 log entries)

**Problems:**
- Only 2 summary metric cards — calendar, reminders, tasks, finance have no quick glance card
- No current week calendar strip
- No status line ("Todo listo" vs "Tienes X cosas pendientes")
- SummaryCard shows only icon + value + label — no status line, no action hint
- ListSections are flat text lists with badges — no visual hierarchy
- RecentActivity as a primary section adds noise without helping the user decide what to do
- Dashboard cards don't feel like a "home cockpit" — too list-heavy, too text-heavy
- No "Añadir" quick actions on dashboard cards
- No calendar widget

### Finance (`components/finance/FinanceTabs.tsx`)

**Current structure:**
- Horizontal scrollable pill tabs: Resumen | Pagos fijos | Gastos | Ahorro | Suscripciones
- Each tab renders a full tab content component

**Problems:**
- Pills are basic styled buttons without visual weight
- On narrow mobile, the tab row overflows and requires scrolling
- No visual indicator of which tab is active beyond colour change
- "Pagos fijos" label is long — wraps or causes overflow
- KPIs in ResumenTab need to be checked for 2-column mobile layout
- Papelera is not on the main Finance UI (this is correct) — but needs a visible path to it

### Calendar (`components/calendar/CalendarView.tsx`)

**Current structure:**
- View switcher: mensual | semanal | próximos (pill buttons, same pattern as Finance)
- Default: mensual (monthly grid)
- Monthly: 7-column grid with event dots
- Weekly: card per day with event list
- Próximos: chronological flat list
- FAB: "Añadir evento" (fixed bottom right)

**Problems:**
- Defaults to monthly — design calls for week-first default
- View labels ("Vista mensual", "Vista semanal", "Próximos eventos") are verbose
- Weekly view shows a card per day — works but not visually differentiated from other card lists
- No week strip component that can be shared with dashboard
- Selected day state (clicking a month day opens a Modal) — acceptable but could be in-page

### Component gaps

Missing components (need to create):
- `WeekStripCard` — horizontal week display with day dots, "today" highlight
- `DashboardMetricCard` — larger card with icon, metric, status line, deep-link
- `MoreMenuSheet` — polished bottom sheet/grid for Más menu
- `FinanceSectionSelector` — dedicated segmented control for Finance tabs
- `CalendarWeekStrip` — compact week row for calendar and dashboard

Existing components that need visual polish:
- `SummaryCard` — needs more hierarchy (icon left, metric large, status line, action hint)
- `ListSection` — needs better item cards, not bare text rows
- `EmptyState` — functional but could be richer (larger icon, better copy spacing)
- `Card` — add `variant` prop (default, featured, subtle) for hierarchy
- `BottomNav` — active indicator needs stronger contrast

### Design token gaps

Current tokens defined in `app/globals.css` (Tailwind v4 `@theme inline`):
- Colours: cream, sand, card, terracotta, coral, sage, olive, amber, rose, brown, muted, border, success, warning-text, danger ✅
- Missing: shadow tokens, explicit border-radius tokens, spacing scale tokens

---

## 2. Issues mapped to milestones

| # | Issue | Milestone |
|---|---|---|
| 1 | Navigation order (Calendario → primary) | UI-2 |
| 2 | "Más" menu as bottom sheet | UI-2 |
| 3 | Dashboard only has 2 metric cards | UI-3 |
| 4 | No calendar week strip on dashboard | UI-3 |
| 5 | No status line on greeting card | UI-3 |
| 6 | SummaryCard too flat | UI-1 / UI-3 |
| 7 | ListSection items not visual enough | UI-1 / UI-3 |
| 8 | RecentActivity too prominent | UI-3 |
| 9 | Finance tab overflow / visual weight | UI-4 |
| 10 | Finance KPI layout on mobile | UI-4 |
| 11 | Calendar defaults to monthly | UI-5 |
| 12 | No shared week strip component | UI-1 / UI-5 |
| 13 | Calendar week view could be richer | UI-5 |
| 14 | Missing design tokens (shadows, radius) | UI-1 |
| 15 | EmptyState needs more polish | UI-1 |
| 16 | Card needs variants | UI-1 |
| 17 | Papelera path hidden but should be findable | UI-2 |
| 18 | iPad layout stretches mobile | UI-7 |
| 19 | Module pages need consistent headers | UI-6 |

---

## 3. Reusable component plan

### New components to create

```
components/ui/
  WeekStrip.tsx           – horizontal Mon–Sun strip, today highlight, event dots
  SegmentedControl.tsx    – horizontal pill selector (Finance tabs, Calendar views)
  MetricCard.tsx          – icon + metric + label + status + link

components/dashboard/
  GreetingCard.tsx        – Hola + household name + status line
  DashboardMetricCard.tsx – icon, metric, status, tap-to-module
  WeekCalendarWidget.tsx  – week strip + next 2-3 events + CTAs

components/layout/
  MoreMenuSheet.tsx       – polished bottom sheet with grid of Más items
```

### Existing components to update

```
components/ui/Card.tsx          – add variant prop (default, featured, subtle, metric)
components/ui/EmptyState.tsx    – larger icon area, better spacing, richer copy
components/ui/Button.tsx        – verify sizes, add size="lg" for FABs
components/dashboard/SummaryCard.tsx  – deprecate or upgrade to MetricCard
components/dashboard/ListSection.tsx  – improve item row visual treatment
components/layout/BottomNav.tsx       – stronger active indicator, improved layout
components/finance/FinanceTabs.tsx    – replace with SegmentedControl
components/calendar/CalendarView.tsx  – default to semanal, add WeekStrip
```

---

## 4. Navigation redesign

### New primary nav (bottom nav)

| Slot | Route | Label | Icon |
|---|---|---|---|
| 1 | /dashboard | Inicio | Home |
| 2 | /calendario | Calendario | CalendarDays |
| 3 | /compra | Compra | ShoppingCart |
| 4 | /finanzas | Finanzas | Wallet |
| 5 | – | Más | MoreHorizontal |

### New Más sheet contents

| Item | Route | Icon |
|---|---|---|
| Recordatorios | /recordatorios | Bell |
| Tareas | /tareas | ListChecks |
| Menú | /menu | UtensilsCrossed |
| Documentos | /documentos | FileText |
| Deseos | /deseos | Heart |
| Ajustes | /ajustes | Settings |
| Archivo y papelera | /ajustes/papelera | Archive |

### Changes to `lib/constants.ts`

```ts
PRIMARY_NAV_ITEMS: /dashboard, /calendario, /compra, /finanzas
MORE_NAV_ITEMS: /recordatorios, /tareas, /menu, /documentos, /deseos, /ajustes, /ajustes/papelera
```

---

## 5. Dashboard redesign plan

New structure for `app/(app)/dashboard/page.tsx`:

```
1. GreetingCard
   - "Hola, {firstName}"
   - "{householdName}"
   - Status line: "Todo en orden" / "Tienes {n} cosas pendientes hoy"

2. Quick metric cards (2-column grid, 3 pairs = 6 cards)
   - Compra: "{n} pendientes" → /compra
   - Menú: "{n} comidas esta semana" → /menu
   - Recordatorios: "{n} pendientes" / "Nada pendiente" → /recordatorios
   - Tareas: "{n} tareas pendientes" → /tareas
   - Calendario: "{n} eventos hoy" → /calendario
   - Finanzas: "{n} pagos próximos" → /finanzas

3. WeekCalendarWidget
   - Week strip (L M X J V S D), today highlighted
   - Up to 3 upcoming events
   - CTAs: "Ver calendario" / "Añadir evento"

4. Upcoming sections (collapsed by default on mobile if empty)
   - Próximos recordatorios (up to 3, with due date/badge)
   - Tareas pendientes (up to 3)
   - Próximos pagos (up to 3 with amount badge)
   - Menú semanal preview (if meals exist this week)

Rules:
- Remove RecentActivity from primary dashboard (move to a "Ver actividad" link)
- Remove savings goal card from dashboard (it's shown in Finanzas)
- Only show subscription renewal if within 7 days (reduce noise)
- All section headers link to their module
```

---

## 6. Finance redesign plan

New structure for `app/(app)/finanzas/page.tsx` + `FinanceTabs`:

```
Header:
  - "Finanzas"
  - Month selector (prev/next)
  - Optional: quick add button

KPI summary row (horizontal scroll or 2-col grid):
  - Pagos próximos (count)
  - Vencidos (count, danger colour if >0)
  - Pagado este mes (amount)
  - Pendiente (amount)
  - Gastos variables (amount)
  - Ahorro (% progress)

Section selector (SegmentedControl):
  - Resumen | Pagos | Gastos | Ahorro | Suscripciones
  - Use compact labels (not "Pagos fijos", just "Pagos")

Section content unchanged functionally.
Archivo y papelera: accessible via overflow menu or footer link, not a tab.
```

---

## 7. Calendar redesign plan

```
Default view: semanal (not mensual)

View selector (SegmentedControl):
  - Semana | Mes | Agenda

Week view improvements:
  - Use WeekStrip at top (shared component)
  - Selected day items shown inline below strip
  - Day row more visually differentiated

Month view:
  - Unchanged functionally
  - Day cell press → show day events inline (not Modal on mobile)

Agenda:
  - Rename "Próximos eventos" → "Agenda"
  - Group by date with date header rows
```

---

## 8. Design system additions (for UI-1)

### Shadow tokens to add to globals.css

```css
--shadow-card: 0 1px 3px 0 rgb(92 64 51 / 0.06), 0 1px 2px -1px rgb(92 64 51 / 0.06);
--shadow-card-hover: 0 4px 6px -1px rgb(92 64 51 / 0.08), 0 2px 4px -2px rgb(92 64 51 / 0.08);
--shadow-modal: 0 20px 25px -5px rgb(92 64 51 / 0.12), 0 8px 10px -6px rgb(92 64 51 / 0.08);
```

### Border radius tokens

```css
--radius-sm: 0.5rem;   /* 8px  – inputs, badges */
--radius-md: 0.75rem;  /* 12px – buttons */
--radius-lg: 1rem;     /* 16px – cards */
--radius-xl: 1.25rem;  /* 20px – modals, sheets */
--radius-full: 9999px; /* pills, avatars */
```

### Typography enhancements

Add `font-display` (system-ui, -apple-system) for headings, `font-body` for body.
Consider adding `Inter` or `Plus Jakarta Sans` as a webfont in a later polish pass (post-MVP).

---

## 9. Files to touch per milestone

### UI-1: Design system + shared components
- `app/globals.css` — add shadow/radius tokens
- `components/ui/Card.tsx` — add variants
- `components/ui/EmptyState.tsx` — improve spacing + copy
- `components/ui/Button.tsx` — verify sizes
- `components/ui/WeekStrip.tsx` — NEW
- `components/ui/SegmentedControl.tsx` — NEW
- `components/ui/MetricCard.tsx` — NEW
- `DESIGN_SYSTEM.md` — add new tokens

### UI-2: Navigation + app shell
- `lib/constants.ts` — update PRIMARY_NAV_ITEMS / MORE_NAV_ITEMS
- `components/layout/BottomNav.tsx` — stronger active, Más as sheet
- `components/layout/MoreMenuSheet.tsx` — NEW (or replace Modal in BottomNav)
- `components/layout/AppShell.tsx` — minor safe-area / layout tweaks
- `components/layout/Sidebar.tsx` — add Calendario, update order

### UI-3: Dashboard
- `app/(app)/dashboard/page.tsx` — full redesign
- `components/dashboard/GreetingCard.tsx` — NEW
- `components/dashboard/DashboardMetricCard.tsx` — NEW
- `components/dashboard/WeekCalendarWidget.tsx` — NEW
- `components/dashboard/ListSection.tsx` — improve item visual
- `components/dashboard/SummaryCard.tsx` — deprecate or repurpose

### UI-4: Finance
- `app/(app)/finanzas/page.tsx` — update layout / header
- `components/finance/FinanceTabs.tsx` — replace tabs with SegmentedControl
- `components/finance/ResumenTab.tsx` — KPI card grid

### UI-5: Calendar
- `app/(app)/calendario/page.tsx` — minor (pass defaultView)
- `components/calendar/CalendarView.tsx` — default semanal, add WeekStrip, rename Agenda

### UI-6: Module polish
- All module pages for consistent headers, empty/loading/error states

### UI-7: Tablet/iPad responsive
- `components/layout/AppShell.tsx` — sidebar on md+
- Dashboard, Finance, Calendar — 2-col grid on iPad

### UI-8: QA + final polish
- Lint, typecheck, build
- Mobile/tablet viewport checks

---

## 10. Risks and constraints

| Risk | Mitigation |
|---|---|
| Changing nav order breaks existing links | Test all routes; links use href constants |
| CalendarView state refactor may break events | Keep functional logic, only change default + visual |
| Finance ResumenTab KPI data unchanged | Only layout changes, same props |
| Supabase data queries unchanged | No data layer changes in UI milestones |
| Spanish copy must stay consistent | Review all new components for Spanish-only labels |
| iPad layout could require significant rework | Start with CSS changes only; no new routes for tablet |

---

## 11. Priority order

1. UI-1: Foundation (components, tokens) — everything else builds on this
2. UI-2: Navigation — immediately visible quality improvement
3. UI-3: Dashboard — the "face" of the app, biggest impact
4. UI-4: Finance — highest friction page currently
5. UI-5: Calendar — now a primary nav item, must be good
6. UI-6: Module polish — incremental, can be done in parts
7. UI-7: Tablet — lower priority than mobile experience
8. UI-8: QA — always last

---

_Last updated: 2026-06-17 (Milestone UI-0)_
