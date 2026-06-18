# Next Steps

## Current state
All 4 critique stages complete (2026-06-18). Score was 25/40; all 16 issues resolved.
Next: planned features from original roadmap.

---

## Planned features (after critique fixes — original roadmap)

### 1. Household activity feed
- Dedicated `/actividad` page or widget on dashboard
- Source: `activity_log` table (already in types as `ActivityLogEntry`)
- Filter by member or module, last 30 days

### 2. CSV export for finance data
- Button on Finanzas: "Exportar datos"
- Client-side CSV from already-loaded data
- Files: gastos, pagos fijos, suscripciones, metas de ahorro

### 3. Recipe import from URL
- Input "Importar desde URL" on new recipe form
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
