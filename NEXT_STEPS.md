# Next Steps

## Current state
All v1 features complete. Post-launch improvements in progress.
Realtime sync, budget tracker, document alerts, and inline add buttons all done.
Savings goal progress charts skipped (user decision).

---

## Planned improvements (suggested order)

### 1. Household activity feed
A "quién hizo qué" log showing recent actions across the household.

- Dedicated `/actividad` page or a widget on the dashboard
- Shows: who added/completed/deleted items, with timestamp and module icon
- Source: `activity_log` table (already referenced in types as `ActivityLogEntry`)
- Filter by member or by module
- Only shows last 30 days

---

### 2. CSV export for finance data
Export expenses, fixed payments, and savings history as a spreadsheet.

- Button on Finanzas page: "Exportar datos"
- Generates CSV client-side (no server needed) from already-loaded data
- Separate files for: gastos, pagos fijos, suscripciones, metas de ahorro
- Filename includes household name and date range

---

### 3. Recipe import from URL
Paste a recipe link, auto-fill name and ingredients.

- Input field on the new recipe form: "Importar desde URL"
- Server action fetches the URL, parses JSON-LD `Recipe` schema
- Pre-fills name, description, servings, ingredients — user reviews before saving
- Graceful fallback if site has no structured data

---

### 4. PDF export for documents / finance summary
Generate a printable summary for mortgage paperwork, insurance records, etc.

- "Exportar PDF" button on Documentos page and Finanzas Resumen tab
- Uses `@react-pdf/renderer` or print stylesheet
- Finance: fixed payments, subscriptions, mortgage overview, savings goals
- Documents: list with type, provider, expiry date

---

### 5. Per-device notification sound / vibration preferences
- Extend `push_subscriptions` with `sound_enabled` and `vibration_enabled`
- Settings in `/ajustes/dispositivos`: toggle per registered device
- Pass preference in push payload for service worker to apply on delivery

---

### 6. Recurring chore history and streaks
- History tab per chore: calendar heatmap of completions
- Streak counter (current + longest)
- "Completado por" tracking — who marked it done

---

### 7. Wishlist voting / approval flow
- "Aprobado por ambos" status requiring both members to approve
- Notification to other member when new item added
- Prevents surprise purchases

---

## Known pending deploys
- Run `npx vercel --prod` to deploy all session changes to production
- Edge Function unchanged — no redeploy needed
