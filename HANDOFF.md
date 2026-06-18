# Home Hub — Handoff Document
Updated: 2026-06-18 (Impeccable audit + design critique complete)

## Current state
Full impeccable audit + critique run against codebase. All critical (P0) and high-priority (P1) issues fixed.
Build, lint, typecheck all pass (0 errors).

## Production URL
https://home-hub-dun.vercel.app

## Deploy
GitHub push to main auto-triggers Vercel deploy (Hobby plan requires public repo — intentional, see KNOWN_ISSUES.md).

## Last known good state
- Build, lint, typecheck all pass (0 errors)
- Last commit: `22394f7` — "Audit fixes: remove universal glassmorphism, unify icons, harden quick-add, regen DESIGN.md"
- Pushed to origin main ✓

## Design identity (Índigo Profundo · Dark-first · Two-tier glass)
- **Background:** deep indigo `#0D0B1F` + azulejo SVG tile + depth ellipse — no floating orbs
- **Brand accent:** saffron gold `#E8C547` (`--color-terracotta` CSS var, historical name kept)
- **Surfaces:** opaque `rgba(255,255,255,0.07)` cards — NO backdrop-filter on content surfaces
- **Two-tier glass rule:** blur only on nav bars (`blur(20px)`) and modals/sheets (`blur(24px)`); toasts `blur(8px)`
- **Text:** `#F0F6FC` primary (`brown` token), `#94A3B8` secondary (`muted` token)
- **Fonts:** Nunito (`--font-sans` body) + Fraunces (`--font-display` hero headings only)
- **Icons:** Phosphor Icons v2 only; SSR path (`/dist/ssr`) for server components
- **Token strategy:** CSS var names inherited from original Azulejo design — actual values documented in DESIGN.md

## Audit fixes applied (2026-06-18)
- Removed `backdrop-filter` from all content surfaces: Card, MetricCard, Input, Select, Textarea, EmptyState, dashboard page, ResumenTab
- Migrated Lucide → Phosphor in all touched UI components (Button, Select, Modal, Toast, ShoppingList, dashboard)
- Fixed all `text-[11px]` violations → `text-[12px]`: BottomNav, ResumenTab (×5), MealSlot
- Removed toast side-stripe `w-0.5` accent span (absolute ban)
- Removed dashboard `uppercase tracking-wide` from section label (absolute ban)
- Standardised `border-white/[0.12]` → `border-border` in MetricCard and ResumenTab
- Wired quick-add success/error toasts in ShoppingList (was silently failing)
- Regenerated DESIGN.md with accurate token values and two-tier glass rule
- Critique snapshot saved: `.impeccable/critique/2026-06-18T13-33-04Z__home-hub-full-app.md` (score 23/40)

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
