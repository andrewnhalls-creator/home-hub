# Next Steps

## Current state
All v1 features complete. Azulejo light palette in place, glassmorphism removed, onboarding improved.
Audit: 16/20. P1/P2 fixes ready to action next session.
Deploy pending: run `npx vercel --prod`.

---

## Next session — audit fixes (do in order)

### 1. Deploy to production first
```
npx vercel --prod
```

### 2. [P1] Fix ExpenseCharts off-brand colors
**File**: `components/finance/ExpenseCharts.tsx:29,195,245`
Replace `SLICE_COLORS` (`#0a84ff` iOS blue etc.) and bar `fill` with brand palette.
Suggested warm chart palette:
- Bar fill: terracotta `oklch(0.52 0.128 32)`
- Slices: terracotta, sage, amber, rose, olive, muted (use CSS hex equivalents)
Command: `/impeccable colorize components/finance/ExpenseCharts.tsx`

### 3. [P1] Fix 10px calendar text
**Files**: `components/dashboard/WeekCalendarWidget.tsx:58`, `components/calendar/CalendarView.tsx:350`
Change `text-[10px]` → `text-xs` (12px). Also `text-[11px]` in `WeekStrip.tsx:58` → `text-xs`.
Command: `/impeccable typeset`

### 4. [P2] Remove uppercase eyebrow section headers
**Files**: `components/search/SearchView.tsx:83`, `components/notifications/NotificationCentre.tsx:96`, `components/finance/MortgageTab.tsx:226`
Remove `uppercase tracking-wide` from section label classes. Use plain `text-xs font-medium text-muted` or a `border-t` separator.
Command: `/impeccable clarify`

### 5. [P2] Verify muted placeholder contrast live
Deploy first, then check `placeholder:text-muted` in any input on the live app with a contrast tool.
If under 4.5:1, darken muted in `globals.css` from `oklch(0.44 0.016 86)` → `oklch(0.40 0.016 86)`.
Command: `/impeccable polish`

### 6. Update DESIGN.md
DESIGN.md still documents old Aceite de oliva / Granito values. Bring it in sync with Azulejo (globals.css is the source of truth).
Command: `/impeccable document`

---

## Planned features (suggested order)

### 1. Household activity feed
- Dedicated `/actividad` page or widget on dashboard
- Source: `activity_log` table (already in types as `ActivityLogEntry`)
- Filter by member or module, last 30 days

### 2. CSV export for finance data
- Button on Finanzas: "Exportar datos"
- Client-side CSV from already-loaded data
- Separate files: gastos, pagos fijos, suscripciones, metas de ahorro

### 3. Recipe import from URL
- Input: "Importar desde URL" on new recipe form
- Server action fetches URL, parses JSON-LD `Recipe` schema
- Pre-fills name, description, servings, ingredients

### 4. PDF export for documents / finance summary
- "Exportar PDF" on Documentos and Finanzas Resumen
- `@react-pdf/renderer` or print stylesheet

### 5. Per-device notification sound / vibration preferences
- Extend `push_subscriptions` with `sound_enabled`, `vibration_enabled`
- Settings in `/ajustes/dispositivos`

### 6. Recurring chore history and streaks
- History tab per chore: calendar heatmap of completions
- Streak counter (current + longest), "completado por" tracking

### 7. Wishlist voting / approval flow
- "Aprobado por ambos" status requiring both members to approve
- Notification to other member when new item added
