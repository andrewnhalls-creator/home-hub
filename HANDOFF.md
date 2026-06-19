# Home Hub — Handoff Document
Updated: 2026-06-19 (Doc alignment sweep complete — Task 4 pending)

## Current state
All 6 doc alignment fixes done. Build still passes. All pushed to origin main. Only Task 4 (GitHub repo privacy decision) remains.

## Production URL
https://home-hub-dun.vercel.app

## Deploy
GitHub push to main auto-triggers Vercel deploy (Hobby plan requires public repo — see Task 4).

## Last known good state
- Build, lint, typecheck all pass (0 errors)
- Last commit: `893c4fb` — "DESIGN.md: update form input border token border-white/[0.12] → border-border"
- All pushed to origin main

## Doc alignment fixes: all complete

| # | File | Fix | Commit |
|---|---|---|---|
| 1 | `CLAUDE.md` | Replaced stale pastel design section with Índigo Profundo spec; fixed icon lib and accessibility line | `c6eb18f` |
| 2 | `DESIGN_SYSTEM.md` | Added deprecation header pointing to `DESIGN.md` | `b62a8e5` |
| 3 | `KNOWN_ISSUES.md` | Moved "Más crash" from Active to Resolved | `67a8f6d` |
| 4 | `UI_REDESIGN_PLAN.md` | Marked all milestones complete | `423e9dc` |
| 5 | `README.md` | Updated style guide reference to `DESIGN.md` | `da6a428` |
| 6 | `DESIGN.md` | Updated form input border token to `border-border` | `893c4fb` |

## Design identity (Índigo Profundo · Dark-first · Two-tier glass)
- **Background:** deep indigo `#0D0B1F` + azulejo SVG tile + depth ellipse
- **Brand accent:** saffron gold `#E8C547` (`--color-terracotta` CSS var, historical name kept)
- **Surfaces:** opaque `rgba(255,255,255,0.07)` cards — NO backdrop-filter on content surfaces
- **Two-tier glass rule:** blur only on nav bars (`blur(20px)`) and modals/sheets (`blur(24px)`); toasts `blur(8px)`
- **Text:** `#F0F6FC` primary (`brown` token), `#94A3B8` secondary (`muted` token)
- **Fonts:** Nunito (`--font-sans` body) + Fraunces (`--font-display` hero headings only)
- **Icons:** Phosphor Icons v2 only; SSR path (`/dist/ssr`) for server components
- **Canonical design doc:** `DESIGN.md`

## Navigation structure
### Mobile bottom bar (5 items)
Inicio · Calendario · Compra · Finanzas · **Más**

### Más sheet (10 items)
Menú semanal · Recordatorios · Tareas · Documentos · Deseos · Actividad · Ajustes · Notificaciones · Dispositivos · Papelera

## SQL migrations applied
- 001–022 (full schema incl. chore_completions)

## Edge Function + pg_cron
- `send-push` v8 deployed; `send-push-cron` (every min) + `document-expiry-scan` (08:00 UTC daily)

## Completed milestones
- ✅ Glassmorphism redesign Phases 1–5
- ✅ Feature 7: PDF export
- ✅ Impeccable audit + all P0/P1 fixes
- ✅ Task 1: Más sheet crash fixed
- ✅ Task 2: Lucide → Phosphor migration + border/text fixes
- ✅ Task 3: Final review + build (0 errors), secrets clean, SSR fixes
- ✅ Doc alignment sweep (Fixes 1–6)
- ⏳ Task 4: GitHub repo privacy decision
