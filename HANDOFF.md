# Home Hub — Handoff Document
Updated: 2026-06-18 (Features 1–6 complete; Feature 7 remaining)

## Current state
6 of 7 planned features complete. Build, lint, typecheck all pass.
**Do not deploy until Feature 7 is done and the deploy checklist is complete.**

## Production URL
https://home-hub-dun.vercel.app

## Deploy
GitHub push to main auto-triggers Vercel deploy (Hobby plan requires public repo — intentional, see KNOWN_ISSUES.md).

## Last known good state
- Build, lint, typecheck all pass (0 errors)
- Last commit: `3cbf729` (Feature 6: Chore history, heatmap, and streaks)
- Pushed to origin main ✓

## Design identity (Azulejo — light-first)
- **Palette:** warm off-white bg `oklch(0.972 0.006 86)`, near-white cards, terracotta primary `oklch(0.52 0.128 32)`
- **Light-first:** `:root` is light; dark mode via `@media (prefers-color-scheme: dark)`
- **Surfaces:** solid Card (no glassmorphism); `default` and `featured` variants have a subtle outer bezel ring
- **Font:** Plus Jakarta Sans (`--font-jakarta`)
- **Icons:** Phosphor `weight="light"` on BottomNav, TopBar, MoreMenuSheet, MetricGrid. Lucide remains on Sidebar and all other components.

## Navigation structure
### Mobile bottom bar (5 items)
Inicio · Calendario · Compra · Finanzas · **Más**

### Más sheet (10 items)
Menú semanal · Recordatorios · Tareas · Documentos · Deseos · **Actividad** · Ajustes · Notificaciones · Dispositivos · Papelera

### TopBar
Logo "Home Hub" (→ /dashboard) · page title (centre, mobile) · MagnifyingGlass · Notifications

## Features completed this session
1. ✅ CSV export for finance data (`components/finance/ExportButton.tsx`)
2. ✅ Household activity feed at `/actividad` (`components/activity/ActivityFeed.tsx`)
3. ✅ Recipe import from URL via JSON-LD (`components/meals/NewRecipeClient.tsx`)
4. ✅ Wishlist voting / approval flow (migration 020, `components/wishlist/WishlistList.tsx`)
5. ✅ Per-device notification preferences (migration 021, Edge Function v8, `components/settings/DevicesView.tsx`)
6. ✅ Chore history, heatmap, and streaks (migration 022, `/tareas/[id]`)

## SQL migrations applied
- 001–019: full schema (previous sessions)
- 020: `wishlist_items.votes jsonb`
- 021: `push_subscriptions.sound_enabled`, `vibration_enabled`
- 022: `chore_completions` table with RLS

## Edge Function
- `send-push` v8 — deployed; now includes per-subscription sound/vibrate in payload

## pg_cron jobs
- jobid 1: `send-push-cron` — every minute
- jobid 2: `document-expiry-scan` — daily 08:00 UTC
