# Next Steps

## Current state
App and Edge Function fully deployed. All v1 + post-launch items complete.

---

## Planned improvements (suggested order)

### 1. Richer calendar
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

### 9. Household activity feed
A "quién hizo qué" log showing recent actions across the household.

- Dedicated `/actividad` page or a widget on the dashboard
- Shows: who added/completed/deleted items, with timestamp and module icon
- Source: `activity_log` table (already referenced in types as `ActivityLogEntry`)
- Filter by member or by module
- Only shows last 30 days to keep it relevant

---

### 10. CSV export for finance data
Export expenses, fixed payments, and savings history as a spreadsheet.

- Button on Finanzas page: "Exportar datos"
- Generates a CSV client-side (no server needed) using the data already loaded
- Separate sheets/files for: gastos, pagos fijos, suscripciones, metas de ahorro
- Filename includes household name and date range

---

### 11. Recipe import from URL
Paste a recipe link, auto-fill name and ingredients.

- Input field on the new recipe form: "Importar desde URL"
- Server action fetches the URL, parses structured recipe data (JSON-LD `Recipe` schema is on most food sites)
- Pre-fills name, description, servings, ingredients — user reviews before saving
- Falls back gracefully if the site doesn't have structured data

---

### 12. PDF export for documents / finance summary
Generate a printable summary for things like mortgage paperwork or insurance records.

- "Exportar PDF" button on the Documentos page and Finanzas Resumen tab
- Uses `@react-pdf/renderer` or a simple print-stylesheet approach
- Finance summary: fixed payments, subscriptions, mortgage overview, savings goals
- Documents summary: list of docs with type, provider, expiry date

---

### 13. Per-device notification sound / vibration preferences
Let each device customise how notifications feel.

- Extend `push_subscriptions` table with `sound_enabled` and `vibration_enabled` booleans
- Settings in `/ajustes/dispositivos`: toggle sound and vibration per registered device
- Pass preference in the push payload so the service worker can apply it on delivery

---

### 14. Recurring chore history and streaks
Make chores more motivating with a completion history view.

- History tab per chore: calendar heatmap of completions
- Streak counter (current + longest)
- "Completado por" tracking — who marked it done
- Useful for accountability between household members

---

### 15. Wishlist voting / approval flow
Let both members approve or veto wishlist items before they're purchased.

- "Aprobado por ambos" status that requires both members to tap Aprobar
- Notification to the other member when a new item is added
- Prevents surprise purchases — both people have visibility

