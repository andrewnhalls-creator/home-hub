# Home Hub — Handoff Document
Updated: 2026-06-18 (Glassmorphism redesign — Phases 1–5 complete)

## Current state
Glassmorphism redesign complete. All 5 phases shipped and pushed.
Feature 7 (PDF export) is next — resume now that redesign is done.
Build, lint, typecheck all pass (0 errors).

## Production URL
https://home-hub-dun.vercel.app

## Deploy
GitHub push to main auto-triggers Vercel deploy (Hobby plan requires public repo — intentional, see KNOWN_ISSUES.md).

## Last known good state
- Build, lint, typecheck all pass (0 errors)
- Last commit: glassmorphism Phase 1 (globals.css + TypeUI setup)
- Pushed to origin main ✓

## Design identity (Glassmorphism · Deep Indigo · Dark-first)
- **Background:** deep indigo `#0D0B1F` with subtle atmospheric gradient (mint + indigo orbs)
- **Brand accent:** mint green `#8AFFC4` (replaces terracotta)
- **Surfaces:** frosted glass — `rgba(255,255,255,0.07)` + `backdrop-filter: blur(20px)` + edge highlights
- **Text:** light `#F0F6FC` headings, `#94A3B8` body
- **Font:** Plus Jakarta Sans (Google Sans stand-in, already loaded)
- **Glass utility:** `.glass` class in globals.css applies full backdrop-filter treatment
- **Token strategy:** old token names kept (`cream`, `card`, `terracotta`, etc.) but remapped to glassmorphism values — components pick up the new look without code changes

## TypeUI design system
- Workspace design system: "Glassmorphism Design System" (ID: 75d7e77e-5fe0-4711-a3ff-1c9159a929bc)
- Files: `.agents/skills/typeui-design-system/` (29 files, committed)
- `.claude/skills/typeui-design-system/` (gitignored, local only)
- TypeUI fundamentals: installed to `.claude/skills/typeui-fundamentals/` (gitignored)
- Local spec folder: `glassmorphism-design-system/` (source of truth for component specs)

## Navigation structure
### Mobile bottom bar (5 items)
Inicio · Calendario · Compra · Finanzas · **Más**

### Más sheet (10 items)
Menú semanal · Recordatorios · Tareas · Documentos · Deseos · **Actividad** · Ajustes · Notificaciones · Dispositivos · Papelera

### TopBar
Logo "Home Hub" (→ /dashboard) · page title (centre, mobile) · MagnifyingGlass · Notifications

## SQL migrations applied
- 001–019: full schema
- 020: `wishlist_items.votes jsonb`
- 021: `push_subscriptions.sound_enabled`, `vibration_enabled`
- 022: `chore_completions` table with RLS

## Edge Function
- `send-push` v8 — deployed

## pg_cron jobs
- jobid 1: `send-push-cron` — every minute
- jobid 2: `document-expiry-scan` — daily 08:00 UTC

## Glassmorphism redesign phases
- ✅ Phase 1: globals.css tokens + TypeUI setup
- ✅ Phase 2: Core UI components (Card, Button, Input, Modal, Badge, Toast, EmptyState, Checkbox, ProgressBar)
- ✅ Phase 3: Navigation shell (BottomNav, TopBar, Sidebar, MoreMenuSheet)
- ✅ Phase 4: Key pages (Dashboard MetricCard, Finance KpiChip, Calendar today ring)
- ✅ Phase 5: Module polish — all text-white→text-cream contrast fixes, OfflineBanner dark mode, SegmentedControl indicator
- ⬜ Feature 7: PDF export (next)
