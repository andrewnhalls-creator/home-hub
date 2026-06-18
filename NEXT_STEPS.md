# Next Steps

## Current state
All impeccable critique fixes done (Stages 1–4, 2026-06-18).
The 7 features below are what remains before final deploy. Work them in order.

---

## Feature 1 — CSV export for finance data
**Scope:** easy · no new dependencies · client-side only

- Add an "Exportar datos" button on the Finanzas page (top of the page, or inside ResumenTab).
- On click: generate CSV files client-side from already-loaded data (no extra DB query).
- Export four files in a single zip, or four separate downloads triggered in sequence:
  - `gastos.csv` — variable expenses
  - `pagos-fijos.csv` — fixed payments
  - `suscripciones.csv` — subscriptions
  - `objetivos.csv` — savings goals
- Use the browser's native `Blob` + `URL.createObjectURL` pattern; no library needed.
- Column headers in Spanish. Amounts formatted as plain numbers (no `€` symbol — Excel-compatible).
- File: `components/finance/FinanceTabs.tsx` or a new `ExportButton.tsx` inside `components/finance/`.

---

## Feature 2 — Household activity feed
**Scope:** moderate · uses existing `activity_log` table · new page

- New route: `/actividad` — add to Más sheet between Deseos and Ajustes.
- Source: `activity_log` table (type `ActivityLogEntry` already in `lib/types.ts`).
- Page fetches last 50 entries for the household, ordered `created_at DESC`.
- Display as a vertical timeline list grouped by date ("Hoy", "Ayer", date label).
- Each entry shows: action label (Spanish), module icon, member name, relative time.
- Filter bar at top: "Todos" / "Compra" / "Finanzas" / "Recordatorios" etc. — client-side filter on already-loaded data.
- Empty state: "Todavía no hay actividad registrada."
- Files: `app/(app)/actividad/page.tsx`, `components/activity/ActivityFeed.tsx`.
- Add `/actividad` to `MENU_ITEMS` in `lib/constants.ts` with an appropriate Lucide icon.

---

## Feature 3 — Recipe import from URL
**Scope:** moderate · server action fetches external URL · no new library

- On the new-recipe form (`/menu/recetas/nueva`), add an "Importar desde URL" section above the manual form.
- A single URL input + "Importar" button.
- Server action (`importRecipeFromUrl`): fetches the URL, parses `<script type="application/ld+json">` blocks for a JSON-LD `Recipe` schema object.
- On success: pre-fills name, description, servings, and ingredients in the form below. User can edit before saving.
- On failure (no JSON-LD found, fetch error, wrong schema): show a clear Spanish error — "No hemos podido importar la receta. Comprueba la URL e inténtalo de nuevo."
- The manual form remains fully functional when import is not used.
- File: `app/(app)/menu/recetas/nueva/page.tsx`, new server action in `app/(app)/menu/recetas/actions.ts`.

---

## Feature 4 — Wishlist voting / approval flow
**Scope:** moderate · schema change + UI · uses existing `wishlists` table

- Add a `status` field to wishlist items: `"pendiente"` | `"aprobado"` | `"rechazado"`.
- "Aprobado" requires both household members to have approved (track per-member votes).
- On the wishlist item card: show current vote status badge and two tap-target buttons ("Quiero" / "No ahora").
- When both members approve: item status changes to `"aprobado"`, badge turns green.
- Notification to the other member when a new item is added to the wishlist.
- Schema: migration to add `votes` column (jsonb, keyed by user_id) or a separate `wishlist_votes` table.
- Files: `components/wishlist/WishlistList.tsx`, `app/(app)/deseos/actions.ts`, new migration in `sql/`.

---

## Feature 5 — Per-device notification preferences
**Scope:** moderate · schema change + settings UI

- Extend `push_subscriptions` table: add `sound_enabled boolean default true`, `vibration_enabled boolean default true`.
- Migration: `sql/020_push_subscription_prefs.sql`.
- Settings UI in `/ajustes/dispositivos`: per-device toggles for sound and vibration.
- Edge Function (`send-push-cron`) reads these fields when building the push payload.
- Files: `app/(app)/ajustes/dispositivos/page.tsx`, Edge Function update, new migration.

---

## Feature 6 — Recurring chore history and streaks
**Scope:** larger · new UI components · uses existing `chore_completions` table

- On each chore card in `/tareas`, add a "Ver historial" link that opens a detail sheet or sub-page.
- Detail shows: calendar heatmap of completions for the last 12 weeks, streak counter (current + longest), "completado por" per entry.
- Heatmap: a 12×7 grid of small squares, colour-coded by completion (empty = `bg-sand`, done = `bg-terracotta/60`).
- Streak logic: computed server-side from `chore_completions` ordered by `completed_at`.
- Files: `app/(app)/tareas/[id]/page.tsx`, `components/chores/ChoreHistory.tsx`, `components/chores/CompletionHeatmap.tsx`.

---

## Feature 7 — PDF export for documents / finance summary
**Scope:** larger · new dependency (`@react-pdf/renderer` or print stylesheet)

- Two entry points:
  1. Documentos page: "Exportar lista" button → PDF of all current documents with name, category, expiry, notes.
  2. Finanzas ResumenTab: "Exportar resumen" button → PDF of the current month's summary (income, expenses, savings progress).
- Preferred approach: browser print stylesheet (`@media print`) — no new dependency, works on iOS Safari.
  - Add a `PrintWrapper` component that shows only the target content when printing.
  - Hide BottomNav, TopBar, action buttons via `print:hidden`.
- Only adopt `@react-pdf/renderer` if the print stylesheet approach produces unacceptable output.
- Files: `components/ui/PrintWrapper.tsx`, updates to `app/(app)/documentos/page.tsx` and `components/finance/ResumenTab.tsx`.

---

## Deploy checklist (run before final deploy)
- [ ] All 7 features above complete and manually tested
- [ ] `npm run lint` — 0 errors
- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run build` — succeeds
- [ ] RLS verified on any new tables (wishlist votes, chore_completions queries)
- [ ] New SQL migrations applied to production Supabase project
- [ ] Edge Function redeployed if changed (Feature 5)
- [ ] Commit and push to main → Vercel auto-deploys
