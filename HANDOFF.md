# Home Hub — Handoff Document
Updated: 2026-06-18 (audit P1/P2 fixes applied — targeting 19/20)

## Current state: Audit fixes complete, deploy pending

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
- Last commit: `4ab5cf3` (Update HANDOFF and NEXT_STEPS for Azulejo redesign session)
- Pushed to origin main ✓
- **Deploy pending** — run `npx vercel --prod` to go live
- Edge Function unchanged (no redeploy needed)

## Current design identity (Azulejo — light-first)
- **Palette: "Azulejo"** — light-first: warm off-white bg (`oklch(0.972 0.006 86)`), near-white solid cards, terracotta primary (`oklch(0.52 0.128 32)`)
- **Light-first**: `:root` is light; `@media (prefers-color-scheme: dark)` overrides to warm charcoal. `color-scheme: light dark`
- **No glassmorphism**: all `backdrop-blur` removed from Card, BottomNav, TopBar, Modal, GreetingCard
- **Solid surfaces**: Card `bg-card border border-border shadow-[var(--shadow-card)]`; dark card `oklch(0.24 0.018 65)`
- **Button**: clean warm terracotta glow shadow, no ceramic tile highlights
- **GreetingCard**: `bg-terracotta/8` warm tinted surface
- **BottomNav / TopBar**: `bg-card border-border`, solid

## Audit results (targeting 19/20)
Run: 2026-06-18. P1/P2 fixes applied 2026-06-18.
| Dimension | Score | Status |
|---|---|---|
| Accessibility | 3→4/4 | `text-[10px]` fixed in WeekCalendarWidget, CalendarView, WeekStrip |
| Performance | 4/4 | Clean |
| Theming | 3→4/4 | ExpenseCharts now uses brand palette (terracotta/sage/amber/rose/olive) |
| Responsive | 3→4/4 | Font sizes fixed |
| Anti-Patterns | 3→4/4 | Eyebrow headers removed in SearchView, NotificationCentre, MortgageTab |

### Remaining open issues
- **[P2]** All inputs — `placeholder:text-muted` contrast borderline (~4.5:1). Verify live; darken muted to `oklch(0.40 0.016 86)` in globals.css if under threshold.
- **[P3]** `SummaryCard.tsx` — identical 2×n card grid. Consider per-module accent colours.
- **[P3]** `CalendarEventForm.tsx:40-47` — event colour swatches include cold iOS palette. Replace with warmer equivalents.

## This session's changes (2026-06-18)
1. ✅ **Onboarding improvements** — Empty states teach module value + inline CTA buttons.
2. ✅ **Full palette redesign** — Azulejo light-warm replaces Granito dark-glass. globals.css rewritten.
3. ✅ **Glassmorphism removed** — Card, BottomNav, TopBar, Modal, GreetingCard.
4. ✅ **Audit run** — 16/20. P1/P2/P3 issues documented.
5. ✅ **Audit P1/P2 fixes** — Brand chart colors, min font sizes (text-xs), eyebrow headers removed.

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
