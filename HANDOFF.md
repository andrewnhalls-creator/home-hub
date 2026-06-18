# Home Hub — Handoff Document
Updated: 2026-06-18 (all critique stages done — planned features next)

## Current state
All impeccable critique fixes complete (Stages 1–4). Build, lint, typecheck all pass.
**Do not deploy again until all features in NEXT_STEPS.md are complete.**

## Production URL
https://home-hub-dun.vercel.app

## Deploy
GitHub push to main auto-triggers Vercel deploy (Hobby plan requires public repo — intentional, see KNOWN_ISSUES.md).
Edge Function unchanged — no redeploy needed unless Edge Function code changes.

## Last known good state
- Build, lint, typecheck all pass
- Last commit: `2c6b7eb` (Update HANDOFF and NEXT_STEPS: Stage 4 complete)
- Pushed to origin main ✓
- Deployed to production ✓

## Design identity (Azulejo — light-first)
- **Palette:** warm off-white bg `oklch(0.972 0.006 86)`, near-white cards, terracotta primary `oklch(0.52 0.128 32)`
- **Light-first:** `:root` is light; dark mode via `@media (prefers-color-scheme: dark)`
- **Surfaces:** solid Card (no glassmorphism); `default` and `featured` variants have a subtle outer bezel ring
- **Font:** Plus Jakarta Sans (`--font-jakarta`)
- **Icons:** Phosphor `weight="light"` on BottomNav, TopBar, MoreMenuSheet, MetricGrid. Lucide remains on Sidebar and all other components (migrate incrementally).

## Navigation structure
### Mobile bottom bar (5 items)
Inicio · Calendario · Compra · Finanzas · **Más**
- Más opens `MoreMenuSheet` (not a route)

### Más sheet (9 items)
Menú semanal · Recordatorios · Tareas · Documentos · Deseos · Ajustes · Notificaciones · Dispositivos · Papelera

### TopBar
Logo "Home Hub" (→ /dashboard) · page title (centre, mobile) · MagnifyingGlass · Notifications

## Shopping module (current)
- Quick-add bar at top: name → submit adds instantly; slider icon opens full modal
- Sort toggle: "Por fecha" / "Por categoría" — persisted in `localStorage`
- Filter chips: dismissible when category or store filter active
- Attribution: "Añadido por X" (active, 2+ members) / "Cogido por X" (completed)
- Completion: single-tap toggle with `opacity-60` fade animation

## Dashboard (current)
- "Hoy" section: today's meals (from `meal_plans`), calendar events, overdue reminders — hidden when empty
- MetricGrid (client component): 6 tiles; Recordatorios and Finanzas highlight when overdue items exist
- WeekCalendarWidget, ListSections for reminders/chores/payments/subscriptions

## SQL migrations applied
- 001–019: full schema (see previous sessions)

## pg_cron jobs
- jobid 1: `send-push-cron` — every minute
- jobid 2: `document-expiry-scan` — daily 08:00 UTC
