# Home Hub — Handoff Document
Updated: 2026-06-19 (finance module major update complete)

## Current state
Build passes, lint clean, typecheck clean. All changes pushed to origin main.

### Finance module major update (completed this session)
Migrations 025–027 applied and SQL files created in `sql/`. Data fully seeded for Villa Gay household.

**What shipped:**
- **25-to-25 budget cycle** — `lib/cycle.ts` with `getCurrentCycleDates`, `getCycleLabel`, `getSubscriptionCycleStatus`. All "this month" filtering in `/finanzas` now uses 25th→25th cycle, not calendar month.
- **Income module** — `quincenal` frequency, `payment_day` field shown on each income source and in the form.
- **Subscriptions** — paid/pending chips per billing_day, future-start badge (Google One), renewal label for "otro" cycle (Real Debrid), "Otro (personalizado)" billing option.
- **Presupuestos tab** — category budgets with cycle-scoped spend tracking, progress bars (green/amber/red), add/delete.
- **Plan de Ahorro tab** — 3-phase savings plan auto-selects active phase, per-fund progress bars (emergency fund has 3M/6M milestones), next-phase preview, collapsible mortgage prepayment guidance.
- **Data updates**: Jose income → 1.300 € (día 28), Andrew Pensión quincenal 145 €/15 days, Extra soft-deleted. 9 subscription billing_days set, Carrefour soft-deleted, Google One + Real Debrid added. Luz due_day=3, Coche due_day=1. July expenses added (Alquiler 925 €, Tasa basuras 53,20 €). 3 savings goals seeded. 6 category budgets seeded.

### Bugs fixed this session
1. `GEMINI_API_KEY` missing from Vercel env vars → added by user
2. `gemini-1.5-flash` deprecated → updated to `gemini-2.0-flash` (`734cc52`)
3. Modal focus trap re-ran on every keystroke → fixed with `useRef` pattern (`1b3405b`)
4. Shopping list Plus button was disabled when text field empty → now always tappable; opens detail form if no text typed (`b247d2c`)

### Improvements shipped this session
- 429 from Gemini now returns a readable Spanish error message (`3dd857b`)
- Error toasts stay on screen 7s (up from 4s) (`3dd857b`)
- Page-shaped skeleton loaders for dashboard, compra, and finanzas — perceived load speed much improved (`bdc5f43`)

## AI verification — still pending
Gemini free-tier daily quota was exhausted on 2026-06-19. Resets at UTC midnight (≈2am Spain time). Resume the next day.

Open https://home-hub-dun.vercel.app. Wait ~30s between each prompt.

| # | Prompt | Where to check |
|---|--------|---------------|
| 3 | `Add milk and bread to the shopping list` | /compra → leche + pan appear |
| 4 | `Añade un recordatorio para pagar el seguro el 20 de julio` | /recordatorios → seguro appears |
| 5 | `¿Qué tenemos en la lista de la compra?` | AI describes items, no DB changes |
| 6 | `Crea una suscripción de Netflix por 15 euros al mes` | /finanzas → Suscripciones tab |
| 7 | `Añade el recibo del gas, 60 euros, día 5` | /finanzas → Pagos fijos tab |
| 8 | `Apunta un gasto de supermercado de 45 euros de hoy` | /finanzas → Gastos tab |
| 9 | `Añade una tarea para limpiar el baño, semanal` | /tareas → baño appears |
| 11 | Any English prompt | AI response must be in Spanish |

Already verified:
- ✅ Test 1: Gold sparkle FAB visible bottom-right
- ✅ Test 2: Modal opens with correct title + greeting
- ✅ Test 10: No API key leak in /api/ai responses
- ✅ Typing in the AI input works correctly (modal focus bug fixed)

## Known local issue
`.env.local` has a corrupt `❯ ` prefix on the `GEMINI_API_KEY=` line. Fix manually: remove the `❯ ` at the start of that line. Does not affect Vercel.

## Production URL
https://home-hub-dun.vercel.app

## Last known good state
- Build, lint, typecheck all pass (0 errors)
- Last commit: `a3d9138` (Add Plan de Ahorro tab with phase allocation and mortgage guidance)
- All changes pushed to origin main

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
- ✅ AI assistant — API route + UI + bug fixes (env var, deprecated model, modal focus, error messages)
- ✅ Shopping list Plus button fix
- ✅ Page skeleton loaders (dashboard, compra, finanzas)
- 🔄 AI assistant — manual browser verification (blocked on Gemini quota, resume tomorrow)
