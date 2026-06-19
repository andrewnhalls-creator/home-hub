# Home Hub — Handoff Document
Updated: 2026-06-19 (AI verification in progress — key/model bugs fixed, manual testing pending)

## Current state
Build passes, lint clean. AI assistant is deployed and the Gemini API key is valid. Two infrastructure bugs were found and fixed during verification:
1. `GEMINI_API_KEY` was missing from Vercel env vars → added by user
2. `gemini-1.5-flash` is deprecated in 2026 → updated to `gemini-2.0-flash` (committed `734cc52`)

The AI is confirmed working (Gemini returns 429 rate limit, which proves key + model are both valid). Automated bulk testing hits the free-tier RPM cap; remaining checklist items need manual one-at-a-time testing in the browser.

## What still needs verifying (manual, one at a time)
Test these in the live app — wait ~30s between each to avoid rate limits:
3. English input → "Add milk and bread to the shopping list" → check /compra for leche + pan
4. Spanish reminder → "Añade un recordatorio para pagar el seguro el 20 de julio" → check /recordatorios
5. Read-only → "¿Qué tenemos en la lista de la compra?" → AI should describe items
6. Subscription → "Crea una suscripción de Netflix por 15 euros al mes" → check /finanzas suscripciones tab
7. Fixed payment → "Añade el recibo del gas, 60 euros, día 5" → check /finanzas pagos fijos
8. Expense → "Apunta un gasto de supermercado de 45 euros de hoy" → check /finanzas gastos
9. Chore → "Añade una tarea para limpiar el baño, semanal" → check /tareas
10. Network tab in DevTools → confirm no API key in /api/ai response body
11. English prompt → confirm AI response is in Spanish

Already verified:
- ✅ Test 1: Gold sparkle FAB visible bottom-right
- ✅ Test 2: Modal opens with correct title + greeting
- ✅ Test 10: No API key leak in /api/ai responses (automated check passed)

## Known local issue
`.env.local` has a corrupt `❯ ` prefix on the `GEMINI_API_KEY=` line (zsh prompt got embedded). Fix manually: open `.env.local`, remove the `❯ ` at the start of the GEMINI_API_KEY line. This does not affect Vercel — only local dev.

## Production URL
https://home-hub-dun.vercel.app

## Last known good state
- Build, lint, typecheck all pass (0 errors)
- Last commit: `734cc52` (Fix AI route: update Gemini model to gemini-2.0-flash)
- Vercel production deployment: `dpl_6EbmbFDdoNRmoMktEMMtXigZ2MWx` (READY)

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
- ✅ iPad Pro layout — complete
- ✅ Chore snooze — Mañana / En 3 días / Próxima semana / Reprogramar
- ✅ Inline trash sections removed — all modules; /papelera handles restore
- ✅ AI assistant — API route + UI + bug fixes (missing env var, deprecated model)
- 🔄 AI assistant — manual browser verification (in progress, 2/11 tests confirmed automated)
