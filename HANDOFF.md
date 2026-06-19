# Home Hub — Handoff Document
Updated: 2026-06-19 (AI assistant Sections 1 + 2 complete — API route + chat UI built and pushed)

## Current state
Build passes. AI assistant Sections 1 + 2 complete. Sparkle FAB + chat modal live. Section 3 (end-to-end verification) remains.

## Production URL
https://home-hub-dun.vercel.app

## Last known good state
- Build, lint, typecheck all pass (0 errors)
- Last commit: `1e238ff` (handoff update) — all pushed to origin main
- Vercel auto-deploys on every push to main

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
- ✅ Task 4: Stay on Vercel Hobby, repo stays public (intentional decision)
- ✅ iPad Pro layout — complete (AppShell lg:max-w-5xl; finanzas sidebar nav; ResumenTab lg:grid-cols-6; menu lg:grid-cols-2; calendario max-w fix)
- ✅ Chore snooze — Mañana / En 3 días / Próxima semana / Reprogramar (matches ReminderCard pattern)
- ✅ Inline trash sections removed — recordatorios, calendario, documentos, compra/listas, finanzas; deleted items just disappear; /papelera handles restore
- ✅ AI assistant Section 1 — `app/api/ai/route.ts` (POST /api/ai, Gemini 1.5 Flash, all actions)
- ✅ AI assistant Section 2 — `components/ai/AIChatButton.tsx` + AppShell wiring
- ⏳ AI assistant Section 3 — end-to-end verification (manual test checklist)
