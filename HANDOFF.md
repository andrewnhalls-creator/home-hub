# Home Hub — Handoff Document
Updated: 2026-06-18 (Stage 3 complete)

## Current state: Deployed ✓ — Stages 1–3 critique fixes done

## Production URL
https://home-hub-dun.vercel.app

## Deploy
GitHub push to main auto-triggers Vercel deploy (Hobby plan requires public repo — intentional, see KNOWN_ISSUES.md).
Edge Function unchanged — no redeploy needed unless Edge Function changes.

## Last known good state
- Build, lint, typecheck all pass
- Last commit: `7af7ecf` (Stage 3: Phosphor Light icons + Card double-bezel depth)
- Pushed to origin main ✓
- Deployed to production ✓

## Current design identity (Azulejo — light-first)
- **Palette: "Azulejo"** — warm off-white bg `oklch(0.972 0.006 86)`, near-white cards, terracotta primary `oklch(0.52 0.128 32)`
- **Light-first**: `:root` is light; dark mode via `@media (prefers-color-scheme: dark)`
- **No glassmorphism**: backdrop-blur removed from Card, BottomNav, TopBar, Modal, GreetingCard
- **Solid surfaces**: Card `bg-card border border-border shadow-[var(--shadow-card)]`
- **Font**: Plus Jakarta Sans (`--font-jakarta`)
- **Icons**: Lucide React (migration to Phosphor Light queued — see NEXT_STEPS.md)

## Navigation structure (current)
### Mobile bottom bar (5 items)
Inicio · Calendario · Compra · Finanzas · **Más**
- Más is a button (not a link) — opens MoreMenuSheet from BottomNav
- TopBar no longer has a Más button

### Más sheet contents
Menú semanal · Recordatorios · Tareas · Documentos · Deseos · Ajustes · Notificaciones · Dispositivos · Papelera

### TopBar (mobile)
Logo "Home Hub" (links to /dashboard) · page title (centre) · Search · Notifications

## Impeccable critique results (2026-06-18)
Score: **25/40** (Acceptable — significant improvements needed)
Snapshot: `.impeccable/critique/2026-06-18T06-27-51Z__home-hub-project.md`

All fixes are queued in NEXT_STEPS.md. Start each new session by picking up from Stage 1 below.

### Open issues by priority

| Priority | Issue | File |
|---|---|---|
| ~~P0~~ | ~~"Añadir" button buried below fold — needs fixed FAB~~ | ✓ done |
| ~~P1~~ | ~~Silent failure on shopping mutations — `onError` not wired~~ | ✓ done |
| ~~P1~~ | ~~Dashboard metric grid undifferentiated — no urgency/attention state~~ | ✓ done |
| ~~P2~~ | ~~Active filter state invisible~~ | ✓ done |
| ~~P2~~ | ~~GreetingCard decorative circles~~ | ✓ done |
| ~~P3~~ | ~~Trash disclosure Unicode triangles~~ | ✓ done |
| ~~A11y~~ | ~~MoreMenuSheet focus not trapped~~ | ✓ done |
| ~~A11y~~ | ~~"Show completed" toggle missing `aria-expanded`~~ | ✓ done |
| ~~A11y~~ | ~~`MoreMenuSheet` uses `aria-label` not `aria-labelledby`~~ | ✓ done |
| ~~Visual~~ | ~~Icon weight: Lucide → Phosphor `weight="light"`~~ | ✓ done |
| ~~Visual~~ | ~~Cards single-layer — add double-bezel depth~~ | ✓ done |
| Layout | `AppShell` main `pb-24` doesn't account for iPhone safe area | `AppShell.tsx` |
| Product | Dashboard shows counts not "what to do now" — daily brief concept | `dashboard/page.tsx` |
| Product | Shopping list sorted `created_at DESC` — no category-sort for in-store | `compra/page.tsx` |
| Product | No household attribution on shopping items ("added by" / "taken by") | `ShoppingItemCard.tsx` |
| Product | Item completion requires modal not single tap | `ShoppingItemCard.tsx` |
| Product | No quick-add bar — every item needs a modal form | `ShoppingList.tsx` |

## SQL migrations applied
- 001–019: full schema (see previous sessions)

## pg_cron jobs
- jobid 1: `send-push-cron` — every minute
- jobid 2: `document-expiry-scan` — daily 08:00 UTC
