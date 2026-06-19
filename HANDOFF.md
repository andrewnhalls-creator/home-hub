# Home Hub — Handoff Document
Updated: 2026-06-19 (Tasks 1–3 complete; Task 4 pending)

## Current state
Tasks 1, 2, and 3 complete. Build, lint, typecheck all pass (0 errors). All commits pushed to origin main. Vercel deploying `6e8c30f` (should go green — fixes build error from prior deploy).

## Production URL
https://home-hub-dun.vercel.app

## Deploy
GitHub push to main auto-triggers Vercel deploy (Hobby plan requires public repo — intentional, see Task 4 below).

## Last known good state
- Build, lint, typecheck all pass (0 errors)
- Last commit: `6e8c30f` — "Fix server components using client Phosphor path → /dist/ssr"
- All pushed to origin main

## What was fixed in Task 3
- 3 server components were importing from `@phosphor-icons/react` (client path, uses `createContext`) instead of `@phosphor-icons/react/dist/ssr`:
  - `components/settings/SettingsView.tsx`
  - `components/ui/FloatingAddLink.tsx`
  - `components/dashboard/ListSection.tsx`
- This caused Vercel build to fail with `createContext is not a function` on the `/ajustes` route
- Local build now passes; Vercel rebuild in progress

## Design identity (Índigo Profundo · Dark-first · Two-tier glass)
- **Background:** deep indigo `#0D0B1F` + azulejo SVG tile + depth ellipse
- **Brand accent:** saffron gold `#E8C547` (`--color-terracotta` CSS var, historical name kept)
- **Surfaces:** opaque `rgba(255,255,255,0.07)` cards — NO backdrop-filter on content surfaces
- **Two-tier glass rule:** blur only on nav bars (`blur(20px)`) and modals/sheets (`blur(24px)`); toasts `blur(8px)`
- **Text:** `#F0F6FC` primary (`brown` token), `#94A3B8` secondary (`muted` token)
- **Fonts:** Nunito (`--font-sans` body) + Fraunces (`--font-display` hero headings only)
- **Icons:** Phosphor Icons v2 only; SSR path (`/dist/ssr`) for server components
- **Token strategy:** CSS var names inherited from original Azulejo design — actual values documented in DESIGN.md

## Completed work
- Task 1: Fixed Más sheet crash — missing `/actividad` → `ClockClockwise` icon entry (`3791097`)
- Task 2: Full audit sweep — migrated all 51 files from lucide-react to @phosphor-icons/react, fixed 2× sub-12px text, removed 2× uppercase tracking-wide labels (`28c44d9`)
- Task 2 (remaining): Fixed `border-white/[0.12]` → `border-border` in 7 UI components (`f7eefff`)
- Task 3: Push, lint/typecheck/build (0 errors), English text sweep (clean), secrets check (clean), fixed 3 server components using client Phosphor path (`6e8c30f`)

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

## Milestones
- ✅ Glassmorphism redesign Phases 1–5
- ✅ Feature 7: PDF export (browser print, @media print token remap)
- ✅ Impeccable audit + critique (2026-06-18) — P0/P1 issues resolved, DESIGN.md regenerated
- ✅ Task 1: Más button crash fixed (`3791097`)
- ✅ Task 2: Full Lucide → Phosphor migration + sub-12px + uppercase sweep (`28c44d9`)
- ✅ Task 2 (remaining): border-white/[0.12] → border-border (`f7eefff`)
- ✅ Task 3: Final review + build — all green, pushed (`6e8c30f`)
- ⏳ Task 4: GitHub repo privacy decision
