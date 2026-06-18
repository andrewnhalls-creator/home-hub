# Next Steps

## Current state
All v1 features complete. Azulejo light palette in place, glassmorphism removed, onboarding improved.
Deploy pending: run `npx vercel --prod`.

## Immediate (next session)

### 1. Deploy to production
```
npx vercel --prod
```

### 2. `/impeccable audit app/` — a11y + responsive check
Run a proper audit against the live app on the new light palette:
- Contrast check: muted text on warm-off-white bg, terracotta on light surfaces
- Responsive check at 375px mobile viewport
- Dark mode: verify solid dark cards look good without glass

### 3. Update DESIGN.md to reflect Azulejo palette
DESIGN.md still documents the old Aceite de oliva / Granito values. Bring it in sync with what's actually in globals.css.

---

## Planned improvements (suggested order)

### 1. Household activity feed
A "quién hizo qué" log showing recent actions across the household.
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
