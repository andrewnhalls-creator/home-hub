# Next Steps

## Current state
App and Edge Function fully deployed. All v1 + post-launch items complete.

---

## Planned improvements (suggested order)

### 1. Dark mode (follows system)
Automatically switches between light and dark based on the iOS/iPadOS/Android system setting.

- Add `darkMode: 'media'` strategy (Tailwind v4 uses `@media (prefers-color-scheme: dark)` natively)
- Define dark-mode overrides for all CSS colour tokens in `globals.css` inside a `@media (prefers-color-scheme: dark)` block
- Key surfaces to remap: `--color-cream`, `--color-card`, `--color-sand`, `--color-border`, `--color-brown`, `--color-muted`
- Test on real device with system dark mode toggled

---

### 2. Expense analytics charts
Visual spend breakdowns on the Finanzas → Gastos tab.

- Monthly spend bar chart (last 6 months)
- Category breakdown donut/pie chart for the selected month
- Week-over-week comparison line for grocery spend (links to shopping list data)
- Library: use `recharts` (already common in Next.js projects, small bundle) or native SVG for simplicity
- All chart colours must be accessible (not red/green only) and respect `prefers-reduced-motion`

---

### 3. Richer calendar
Make the calendar more useful for day-to-day household planning.

- Multi-day events (store `start_date` + `end_date` on calendar_events, render as spanning blocks)
- Drag-to-reschedule on the week view (touch-friendly, debounced save)
- "Añadir al calendario" shortcut from reminder/chore/payment detail views
- Event colour customisation per event (not just per type)

---

### 4. Meal plan → shopping list generator
One-tap: generate a shopping list from the current week's meal plan.

- Button on `/menu` page: "Generar lista de la compra"
- Reads all recipes planned for the week, collects their ingredients
- Creates a new shopping list with all ingredients as items (deduplicating where possible)
- User can review and edit before saving

---

### 5. Realtime shopping list sync
When one person checks off an item, the other sees it immediately.

- Use Supabase Realtime channel on `shopping_items` filtered by `household_id`
- Subscribe in `ShoppingList` client component on mount, update local state on INSERT/UPDATE/DELETE events
- Graceful fallback if Realtime is unavailable (existing offline queue still works)

---

### 6. Document expiry push alerts
Auto-notify before important documents expire (passports, insurance, ITV, etc.).

- Supabase Cron job (or extend existing cron): daily scan of `household_documents` where `expiry_date` is 30 days / 7 days / 1 day away and `deleted_at IS NULL`
- Create `scheduled_notifications` rows for matched documents
- Existing Edge Function delivers the push — no changes needed there
- Migration: add `expiry_reminder_sent_at` to avoid duplicate alerts

---

### 7. Monthly budget tracker
Set a monthly household budget and track actual spend against it.

- New field on household settings (or a dedicated `budget_settings` table): `monthly_budget`
- Resumen tab: progress bar showing spend-to-budget ratio for current month
- Colour feedback: green → amber → red as spend approaches/exceeds budget

---

### 8. Savings goal progress charts
Visual contribution history for each savings goal.

- Line or bar chart of cumulative saved amount over time (using `savings_contributions` table)
- Projected completion date based on average contribution rate

---

## Also considered (lower priority)
- Household activity feed ("quién hizo qué" log)
- CSV/PDF export for finance data
- Recipe import from URL (paste link, auto-fill name + ingredients)
- Per-device notification sound / vibration preferences
