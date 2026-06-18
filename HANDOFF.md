# Home Hub — Handoff Document
Updated: 2026-06-18 (nav restructure + audit clean + deployed)

## Current state: All audit fixes done, nav restructured, deployed to production ✓

## Production URL
https://home-hub-dun.vercel.app

## Deploy command
```
npx vercel --prod
```
(GitHub-triggered deploys blocked on Hobby plan — always use CLI)
Edge Function unchanged — no redeploy needed.

## Last known good state
- Build, lint, typecheck all pass
- Last commit: `1804194` (Update HANDOFF and NEXT_STEPS: nav restructure session complete)
- Pushed to origin main ✓
- **Deployed to production ✓** — live at https://home-hub-dun.vercel.app

## Current design identity (Azulejo — light-first)
- **Palette: "Azulejo"** — warm off-white bg `oklch(0.972 0.006 86)`, near-white cards, terracotta primary `oklch(0.52 0.128 32)`
- **Light-first**: `:root` is light; dark mode via `@media (prefers-color-scheme: dark)`
- **No glassmorphism**: all backdrop-blur removed from Card, BottomNav, TopBar, Modal, GreetingCard
- **Solid surfaces**: Card `bg-card border border-border shadow-[var(--shadow-card)]`

## Navigation structure (current)
### Mobile bottom bar (5 items)
Inicio · Calendario · Compra · Finanzas · **Más**
- Más is a button (not a link) — opens MoreMenuSheet from BottomNav
- TopBar no longer has a Más button

### Más sheet contents
Menú semanal · Recordatorios · Tareas · Documentos · Deseos · Ajustes · Notificaciones · Dispositivos · Papelera

### TopBar (mobile)
Logo "Home Hub" (links to /dashboard) · page title (centre) · Search · Notifications

## Audit results (targeting 19–20/20 — all fixes applied)
| Dimension | Fix applied |
|---|---|
| Accessibility | `text-[10px]`/`[11px]` → `text-xs` across calendar, WeekStrip |
| Theming | ExpenseCharts brand palette (terracotta/sage/amber/rose/olive) |
| Theming | CalendarView iOS blue fallback → `oklch(0.52 0.128 32 / 0.1)` |
| Anti-Patterns | Eyebrow headers removed (SearchView, NotificationCentre, MortgageTab) |
| Anti-Patterns | CalendarEventForm event colours → warm brand palette |
| Accessibility | Muted token darkened `oklch(0.44→0.40 0.016 86)` — placeholder contrast |

## This session's changes (2026-06-18)
1. ✅ Audit P1/P2 fixes — chart colours, font sizes, eyebrow headers
2. ✅ Audit P3 fix — CalendarEventForm warm event colours
3. ✅ DESIGN.md — fully rewritten for Azulejo palette
4. ✅ Muted token darkened for WCAG AA placeholder contrast
5. ✅ Bottom nav restructured: Inicio · Calendario · Compra · Finanzas · Más
6. ✅ Más button moved from TopBar → BottomNav
7. ✅ Menú semanal restored to Más sheet

## SQL migrations applied
- 001–019: full schema (see previous sessions)

## pg_cron jobs
- jobid 1: `send-push-cron` — every minute
- jobid 2: `document-expiry-scan` — daily 08:00 UTC
