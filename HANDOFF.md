# Home Hub — Handoff Document
Updated: 2026-06-17 (Milestone UI-9 complete)

## Current milestone: UI-9 COMPLETE ✓

## Status
All functional milestones (1–22) and UI milestones (UI-0 through UI-9) complete.
Two milestones remain: FIN-9 (mortgage) and any post-MVP work.
Deployed via Vercel CLI (`npx vercel --prod`).

## Last session: UI-9 — Apple Home Glass refresh + navigation update (2026-06-17)

### Colour palette
- `globals.css`: all design tokens replaced with Apple Home Glass palette
- Background: `#F5F8FF` (icy blue-white), Surface: `#FFFFFF`, Primary: `#0A84FF` (Apple blue)
- Secondary: `#5AC8FA` (sky), Teal: `#2DD4BF`, Success: `#34C759`, Danger: `#FF453A`
- Text: `#111827` (near-black), Muted: `#5B6472`, Border: `#D8E6F7`
- Shadows updated to blue-glass tones (replaces warm brown shadows)

### Navigation
- Bottom nav: now 3 items only — Calendario, Compra, Finanzas (Inicio removed from bottom nav)
- Top bar: "Home Hub" brand link on left → /dashboard; "Menu" button on right opens sheet
- "Más" removed from the UI entirely — replaced by "Menu" everywhere
- `constants.ts`: added `MENU_ITEMS` export (10 items including Inicio, Notificaciones, Dispositivos)
- `MoreMenuSheet`: title changed "Más opciones" → "Menu", aria-label "Menú", uses MENU_ITEMS

### Finance
- `FinanceTabs`: added Hipoteca tab (UI-only EmptyState — ready for FIN-9 DB work)
- `finanzas/page.tsx`: all 4 TrashSection components wrapped in a single collapsible
  `<details>` element labelled "Archivo y papelera" — collapsed by default

### Papelera cleanup
- `TrashSection`: updated colours from hardcoded stone-* to design-system tokens
- Reduced visual weight of TrashSection headers (smaller text, less prominent border)
- Finance Papelera now hidden under "Archivo y papelera" disclosure link

### Responsive
- `AppShell`: `min-h-dvh` + `overflow-x-hidden` prevents horizontal scroll
- `Sidebar`: `md:overflow-y-auto` for scrollable nav on small tablets
- `Button`: `ring-offset-card` (#FFFFFF) matches new card surface

## Production URL
https://home-hub-dun.vercel.app

## Deploy command
```
npx vercel --prod
```
(GitHub-triggered deploys blocked on Hobby plan — always use CLI)

## Last known good state
- Build, lint, typecheck all pass
- Committed: b0e20e4
- Pushed to origin main

## Remaining milestones
- **FIN-9**: Hipoteca — mortgage tracking inside Finanzas (new tables + UI)
- **Push notification test**: end-to-end device test still pending (infrastructure working)

## Previously done (summary)
- Milestones 1–22: full functional app, Spanish UI, RLS, push notifications, PWA, offline shopping
- UI-0 through UI-8: design system redesign, navigation, dashboard, finance, calendar, polish
- UI-9: Apple Home Glass palette, navigation update, Hipoteca tab, Papelera cleanup
