# Next Steps

## Current state
Stages 1 + 2 complete (2026-06-18). All P0/P1/P2/P3/A11y critique fixes done.
Impeccable critique run 2026-06-18: **25/40** — 12 issues resolved, Stage 3 next.

---

## Stage 3 — Visual upgrades (icon weight + component depth)

### 3a. Icon weight: Lucide → Phosphor Light
- **Problem**: Lucide at default stroke weight (2px) reads as a generic productivity app — the exact anti-reference in PRODUCT.md (Todoist, TickTick). For a warm domestic app, lighter strokes feel more personal.
- **Install**: `npm install @phosphor-icons/react`
- **Migration strategy**:
  - Start with the most visible surfaces: BottomNav, MoreMenuSheet, TopBar, dashboard MetricCards.
  - Use `weight="light"` and `size={22}` as the standard throughout.
  - Do not mix Phosphor and Lucide in the same component. Migrate module by module.
  - Keep Lucide for any icon with no Phosphor equivalent (check before migrating each one).
- **Do NOT change**: icons inside form inputs or small badges where `size={16}` is used — migrate those last.

### 3b. Card double-bezel depth treatment
- **File**: `components/ui/Card.tsx`
- **Problem**: Cards are single-layer (`bg-card border border-border`). No physical depth or lift.
- **Fix**: Add a subtle outer shell wrapping the inner card content.
  - Outer: `p-[3px] bg-border/50 rounded-[calc(var(--radius-lg)+3px)]`
  - Inner: existing `bg-card rounded-[var(--radius-lg)]` — unchanged visually but now sits inside the outer shell.
  - Apply only to `variant="default"` and `variant="featured"`. Leave `variant="subtle"` flat.
  - Verify this doesn't break any existing usage — check all pages after applying.

---

## Stage 4 — Product design improvements (bigger scope)

### 4a. Single-tap item completion in ShoppingList
- **File**: `components/shopping/ShoppingItemCard.tsx`
- **Problem**: Completing a shopping item in-store requires opening an edit modal. For a 15-item list this is 45+ taps.
- **Fix**: Make tapping the item card (or a dedicated tap-target left area) toggle completion directly — no modal.
  - The edit modal stays accessible via a secondary action (long-press or a `⋯` button).
  - Show a brief completion animation (item fades/strikethrough, then moves to "Comprados" section).

### 4b. Shopping quick-add bar
- **File**: `components/shopping/ShoppingList.tsx`
- **Problem**: Every item addition requires opening a full modal form. 80% of shopping items need only a name.
- **Fix**: Add a sticky quick-add bar pinned below the TopBar (above the list).
  - A single text input ("Añadir producto...") + submit button. Press Enter or tap → adds with name only, default category.
  - The full modal (category, quantity, store, notes) remains accessible via a "+" button next to the input for complex items.
  - This replaces the FAB from Stage 1 — implement Stage 1 first, then decide whether to upgrade to this pattern.

### 4c. Household attribution on shopping items
- **File**: `components/shopping/ShoppingItemCard.tsx`, possibly `ShoppingList.tsx`
- **Problem**: The app knows which household member added and completed each item, but shows nothing. Two people shopping separately cannot coordinate.
- **Fix**: Show a small avatar or name initial on each item indicating who added it.
  - On completed items: show "Cogido por [nombre]" in `text-xs text-muted`.
  - Data is already in the schema (`created_by`, `updated_by` columns) — just needs surfacing in the UI.

### 4d. Dashboard daily brief
- **File**: `app/dashboard/page.tsx`, `components/dashboard/MetricCard.tsx`
- **Problem**: Dashboard shows 6 equal-weight count tiles. It answers "how many items exist?" not "what do I need to do right now?".
- **Fix option A (lower scope)**: Keep MetricCard grid but add a "Hoy" section above it showing:
  - Tonight's meal (from menu planner, if set)
  - Today's calendar events (next 1–2)
  - Any overdue reminders
  This does not require replacing the existing structure.
- **Fix option B (higher scope)**: Replace the metric grid with a time-aware daily brief card as the primary dashboard element. The 6 metric tiles become secondary/collapsed by default.
- **Recommendation**: Start with option A — it adds the daily context users need without removing the overview.

### 4e. Shopping list sort by category (in-store mode)
- **File**: `app/compra/page.tsx`, `components/shopping/ShoppingList.tsx`
- **Problem**: List is sorted `created_at DESC` (newest first). In a supermarket, people shop by aisle/section, not chronologically.
- **Fix**: Add a sort toggle: "Por categoría" (groups items by category, alphabetical within group) vs "Por fecha" (current default).
  - Persist the preference per user in `localStorage` or a user preference field.

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
