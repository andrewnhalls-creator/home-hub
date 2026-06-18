# Next Steps

## Current state
All v1 features complete. Azulejo palette live, audit clean, nav restructured, deployed.
Impeccable critique run 2026-06-18: **25/40** — fixes queued below in priority order.

---

## Stage 1 — P0/P1 UX fixes (do first, highest impact)

### 1a. Shopping add button → fixed FAB (P0)
- **File**: `components/shopping/ShoppingList.tsx`
- **Problem**: "Añadir producto" is a static button below the list — invisible on any non-empty list.
- **Fix**: Replace with `FloatingAddLink` (already exists) as a `fixed` element above the bottom nav.
  - Position: `fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4`
  - Remove the current static button at the bottom of the list.

### 1b. Wire `onError` on all shopping mutations (P1)
- **File**: `components/shopping/ShoppingList.tsx`
- **Problem**: `onSuccess` shows a toast; `onError` is absent — failed saves are completely silent.
- **Fix**: Add `onError` callback to every server action call (`addShoppingItem`, `updateShoppingItem`, `deleteShoppingItem`).
  - Toast message: "No se ha podido guardar. Inténtalo de nuevo."
  - Keep the modal/form open on failure so the user doesn't lose their input.

### 1c. MetricCard urgency/attention state (P1)
- **File**: `components/dashboard/MetricCard.tsx`, `app/dashboard/page.tsx`
- **Problem**: All 6 metric cards look identical regardless of whether something needs action. An overdue payment and an empty calendar have the same visual weight.
- **Fix**: Add an `attention` boolean prop to `MetricCard`.
  - When `attention={true}`: stronger border colour (`border-terracotta`), light tinted bg (`bg-terracotta/5`), icon in `text-terracotta`.
  - Pass `attention={true}` from the dashboard when count > 0 for: overdue reminders, overdue payments, unread notifications.
  - All other cards remain visually neutral.

---

## Stage 2 — P2/P3 polish + accessibility

### 2a. Active filter chip in ShoppingList (P2)
- **File**: `components/shopping/ShoppingList.tsx`
- **Problem**: When a category or store filter is active, there is no visible indicator. Users in a supermarket cannot tell they are seeing a filtered list.
- **Fix**: When any filter is active, render a dismissible chip above the list.
  - Format: "Categoría: Lácteos ×" — tapping × clears that filter.
  - Use `bg-terracotta/10 text-terracotta text-xs rounded-full px-3 py-1` styling consistent with the badge system.
  - One chip per active filter.

### 2b. Remove GreetingCard decorative circles (P2)
- **File**: `components/layout/GreetingCard.tsx`
- **Problem**: Two `absolute rounded-full bg-terracotta/10` circles in the top-right corner are the most recognisable AI-generated decoration pattern. They signal template, not personality.
- **Fix**: Delete both circle divs. The terracotta-tinted card background is sufficient. If a visual accent is wanted, use one small contextual SVG icon (house, key, or heart).

### 2c. Fix trash disclosure in Finanzas (P3)
- **File**: `app/finanzas/page.tsx`
- **Problem**: Open/close toggle uses raw `▸`/`▾` Unicode triangles — inconsistent with the Lucide icon system and inaccessible.
- **Fix**: Replace with `<ChevronRight size={14} />` / `<ChevronDown size={14} />` from `lucide-react`, styled with `text-muted transition-transform`.

### 2d. MoreMenuSheet accessibility fixes
- **File**: `components/layout/MoreMenuSheet.tsx`
- **Problem 1**: `aria-modal="true"` declared but no focus trap — keyboard users can Tab past the sheet into the dimmed background.
- **Problem 2**: Uses `aria-label="Menú"` (string) not `aria-labelledby` pointing to the visible `<h2>`.
- **Fix 1**: Add focus trap. Options: `@radix-ui/react-focus-scope` (already a transitive dep via Radix primitives), or add `inert` attribute to the `<main>` content when the sheet is open.
- **Fix 2**: Give the `<h2>` an `id="more-menu-title"` and change `aria-label` to `aria-labelledby="more-menu-title"`.

### 2e. ShoppingList "show completed" toggle accessibility
- **File**: `components/shopping/ShoppingList.tsx`
- **Problem**: The "show/hide completed" toggle button has no `aria-expanded` attribute — screen reader users get no feedback about the section state.
- **Fix**: Add `aria-expanded={showCompleted}` to the toggle button.

### 2f. AppShell safe-area padding fix
- **File**: `components/layout/AppShell.tsx` (or wherever `pb-24` is set on `<main>`)
- **Problem**: `pb-24` does not account for the iPhone home indicator — content is clipped on iPhone X+ devices.
- **Fix**: Change to `pb-[calc(6rem+env(safe-area-inset-bottom))]`.

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
