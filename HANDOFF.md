# Home Hub — Handoff Document
Updated: 2026-06-18 (light palette + glass removal + onboarding improvements)

## Current state: Azulejo light palette live, glassmorphism removed ✓

## Production URL
https://home-hub-dun.vercel.app

## Deploy command
```
npx vercel --prod
```
(GitHub-triggered deploys blocked on Hobby plan — always use CLI)
After deploying app, also redeploy the Edge Function:
```
npx supabase functions deploy send-push
```

## Last known good state
- Build, lint, typecheck all pass
- Last commit: `175b040` (Redesign: light-first palette, remove glassmorphism)
- Pushed to origin main ✓
- **Deploy pending** — run `npx vercel --prod` to go live
- Edge Function unchanged (no redeploy needed)

## Current design identity (Azulejo — light-first)
- **Palette: "Azulejo"** — light-first: warm off-white bg (`oklch(0.972 0.006 86)`), near-white solid cards, terracotta primary (`oklch(0.52 0.128 32)`)
- **Light-first**: `:root` is light; `@media (prefers-color-scheme: dark)` overrides to warm charcoal. `color-scheme: light dark`
- **No glassmorphism**: all `backdrop-blur` removed from Card, BottomNav, TopBar, Modal, GreetingCard
- **Solid surfaces**: Card uses `bg-card border border-border shadow-[var(--shadow-card)]`; dark mode card is `oklch(0.24 0.018 65)` (solid, not transparent)
- **Button**: clean warm terracotta glow shadow (`0 2px 10px oklch(0.52 0.128 32 / 0.22)`), no ceramic tile highlights
- **GreetingCard**: `bg-terracotta/8` warm tinted surface, no glass
- **BottomNav / TopBar**: `bg-card border-border`, solid

## This session's changes (2026-06-18)
1. ✅ **Onboarding improvements** — All empty states now teach module value + have inline CTA buttons. Documentos, Deseos, Finanzas (×4 tabs) rewritten with contextual copy. Archive/edit/trash `title` tooltips added. Deseos differentiates first-use vs filter-empty state.
2. ✅ **Full palette redesign** — Removed Granito dark-glass, replaced with Azulejo light-warm. globals.css rewritten: light `:root`, solid card tokens, clean btn shadow.
3. ✅ **Glassmorphism removed** — Card, BottomNav, TopBar, Modal, GreetingCard all stripped of `backdrop-blur-xl`/`backdrop-blur-2xl` and transparent bg values.

## Completed improvements (chronological)
1. ✅ Web font — Plus Jakarta Sans
2. ✅ Page transitions — fade-up 180ms
3. ✅ Global search `/buscar`
4. ✅ `/papelera` recovery route
5. ✅ Push notification quiet hours
6. ✅ Dark mode support
7. ✅ Expense analytics charts (recharts)
8. ✅ Richer calendar (multi-day, per-event colour)
9. ✅ Meal plan → shopping list generator
10. ✅ Realtime shopping list sync
11. ✅ FAB → inline buttons
12. ✅ Reminder delete removed
13. ✅ Stuck notification badge fixed
14. ✅ Document expiry push alerts (migration 018)
15. ✅ Monthly budget tracker (migration 019)
16. ✅ Global realtime sync (14 tables, debounced router.refresh)
17. ✅ Interaction + animation polish (pass 1)
18. ✅ Animation system (pass 2)
19. ✅ Onboarding / empty state improvements
20. ✅ Azulejo light palette + glassmorphism removal

## SQL migrations applied
- 001–017: initial schema through calendar multi-day/colour
- 018: `scan_document_expiry_notifications()` function + pg_cron job (jobid 2)
- 019: `monthly_budget` column on `households`

## pg_cron jobs
- jobid 1: `send-push-cron` — every minute, processes pending `scheduled_notifications`
- jobid 2: `document-expiry-scan` — daily 08:00 UTC, calls `scan_document_expiry_notifications()`
