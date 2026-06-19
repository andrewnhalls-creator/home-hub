# Home Hub — Handoff Document
Updated: 2026-06-19 (Doc alignment in progress — Fix 1/6 done)

## Current state
Doc alignment sweep underway before making the GitHub repo private. Fix 1 of 6 complete. Build still passes (doc-only changes). All pushed to origin main.

## Production URL
https://home-hub-dun.vercel.app

## Deploy
GitHub push to main auto-triggers Vercel deploy (Hobby plan requires public repo — see Task 4).

## Last known good state
- Build, lint, typecheck all pass (0 errors)
- Last commit: `c6eb18f` — "Update CLAUDE.md: replace stale pastel design section with Índigo Profundo spec"
- All pushed to origin main

## Doc alignment fixes: status

| # | File | Issue | Status |
|---|---|---|---|
| 1 | `CLAUDE.md` | Design style section described old pastel design; icon lib was lucide-react; accessibility said "pastel backgrounds" | ✅ Done (`c6eb18f`) |
| 2 | `DESIGN_SYSTEM.md` | Entire file is old warm/cream design — deprecated in favour of `DESIGN.md` | ⏳ Next |
| 3 | `KNOWN_ISSUES.md` | "Más button broken" still listed as Active — was fixed in Task 1 | ⏳ Pending |
| 4 | `UI_REDESIGN_PLAN.md` | Status line says "UI-0 — plan defined" — all milestones are complete | ⏳ Pending |
| 5 | `README.md` | Links to `DESIGN_SYSTEM.md` as the style guide — should point to `DESIGN.md` | ⏳ Pending |
| 6 | `DESIGN.md` | Form inputs section says `border-white/[0.12]` — components now use `border-border` | ⏳ Pending |

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

## Completed work (all tasks)
- ✅ Task 1: Más sheet crash fixed (`3791097`)
- ✅ Task 2: Lucide → Phosphor migration + sub-12px + uppercase + border-border sweep
- ✅ Task 3: Final review + build (0 errors), English text sweep, secrets check, SSR path fixes
- ✅ Fix 1: CLAUDE.md design section updated (`c6eb18f`)
- ⏳ Fixes 2–6: Doc alignment sweep in progress
- ⏳ Task 4: GitHub repo privacy decision (decide after doc sweep complete)
