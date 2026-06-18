# Next Steps

## Current state
All v1 features complete. Azulejo light palette in place, glassmorphism removed, onboarding improved.
Audit: 16/20. P1/P2 fixes ready to action next session.
Deploy pending: run `npx vercel --prod`.

---

## Next session — remaining items

### 1. Deploy to production
```
npx vercel --prod
```

### 2. [P2] Verify muted placeholder contrast live
After deploying, check `placeholder:text-muted` in any input with a contrast tool.
If under 4.5:1, darken muted in `globals.css`: `oklch(0.44 0.016 86)` → `oklch(0.40 0.016 86)`.
Command: `/impeccable polish`

### 3. Update DESIGN.md
DESIGN.md still documents old Aceite de oliva / Granito values. Bring it in sync with Azulejo (globals.css is the source of truth).
Command: `/impeccable document`

### 4. [P3] CalendarEventForm colour swatches
`components/calendar/CalendarEventForm.tsx:40-47` — event colour swatches include cold iOS palette.
Replace with warmer brand-palette equivalents.

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
