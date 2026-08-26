# Home Hub — Handoff Document
Updated: 2026-08-25 (Casa Calma redesign — Stage F1 done)

## Current state
A complete redesign is underway based on the Stitch export in `Chatgpt_Redesign/`:
- `Frontend Designs/` — 36 screens (code.html + screen.png each), design system in `casa_calma/DESIGN.md`
- `HOME_HUB_BACKEND_PROMPT.md` — the backend build spec to follow **after** the frontend stages
- `REDESIGN_PLAN.md` — the staged plan (F1–F12 frontend, then backend phases)

**Stages F1–F6 are complete** (F6 = Menú y recetas, commit abe9db9).

What F6 changed:
- Menú semanal: centred week navigator ("24 – 30 de agosto" + ESTA SEMANA), full-width
  Generar lista button, "Ver recetas del hogar" link, day headers with number chips, and
  MealSlot rows with per-meal icon tiles (Coffee/Sun/MoonStars/Cookie) — dashed
  "Planificar…" style when empty.
- Recetas: `RecipesExplorer` (client search + accent-tile cards with time/difficulty/servings
  meta); detail page is view-first (hero, Ingredientes card, "Añadir ingredientes a la compra"
  primary, numbered Preparación steps parsed from notes) with edit form + delete inside a
  <details> collapsible. Recipe cards/detail verified only with empty data (no recipes yet).
- ShoppingList sort preference now uses useSyncExternalStore (lint-clean, hydration-safe).
- Browser-testing note: the Chrome tab renderer wedged twice on first-compile navigations;
  closing the tab and opening a fresh one fixed it (not an app bug — server responded fine).

What F5 changed:
- Shopping list default view is now grouped category cards (mockup style) with accent-coloured
  headers and flat rows (`ShoppingItemCard flat` prop); "Por fecha" flat view still available
  (localStorage preference now read post-mount to avoid hydration mismatch).
- New "Finalizar compra" flow on the standing list: floating pill (visible when there are
  completed items) opens `FinishShoppingSheet` — summary card with progress, keypad for the
  ticket total, "Confirmar y guardar" → `finishQuickPurchase` action: inserts a Supermercado
  expense and clears completed standing-list items. E2E-tested against live Supabase
  (test expense deleted afterwards). Named lists keep their own markShoppingListPurchased flow.

What F4 changed (commit d93ae68):
- Dashboard recomposed: greeting hero (mobile "¡Hola, X!", desktop time-of-day + date sentence +
  "Añadir nuevo" button → QuickAddSheet), TodayMealCard ("Hoy para comer" sage hero → /menu),
  NextUpCard rows (Próximo evento with event_time, Próximo pago with amount), AttentionCard
  (danger tint, overdue reminders/payments). All render only with real data — no fake content.
- GreetingCard is a server component now; HouseholdSwitcherMenu deleted (TopBar sheet covers it).
- Note: hero cards were verified only with empty data (the live household has no meals/events);
  re-check visually once real data exists.

What F3 changed (commit 27aff2a):
- Login/signup/forgot/reset restyled as centred white cards with icon headers; login has
  field icons, show-password toggle and the mockup's copy ("Bienvenido a casa").
- Onboarding is now two-step: selectable create/join cards ("¿Cómo quieres empezar?") → form.
- New `HouseholdSwitchSheet` ("Seleccionar hogar") opens from the TopBar household pill,
  lists memberships with member counts (fetched in `app/(app)/layout.tsx`) and calls
  `switchHousehold`; "Añadir otra casa" links to /ajustes.
- `Input` gained `icon`, `endSlot`, `labelEnd` props. Build passes, lint 0 errors, typecheck clean. F2 verified visually at 480px and desktop against the live app.

What F2 changed (commit bb4a165):
- Bottom nav: Inicio · Compra · center green quick-add FAB · Finanzas · Calendario; the FAB opens
  `QuickAddSheet` (links to compra/finanzas/tareas/calendario).
- `MoreMenuSheet` deleted → new left `AppDrawer` (profile header, household pill → /ajustes,
  module list with green active pill, Cerrar sesión) opened from the TopBar avatar.
- TopBar: household-name pill (mobile, Inicio) linking to /ajustes; avatar button opens the drawer.
- Sidebar (desktop): grouped nav (main 4 + MÓDULOS + bottom Ajustes/Cerrar sesión), green pill actives.
- `lib/constants.ts` nav icons converted lucide → Phosphor; PRIMARY_NAV_ITEMS reordered.
- Fixed pre-existing OfflineBanner hydration mismatch (`useOnlineStatus` → `useSyncExternalStore`).

What F1 changed:
- `app/globals.css`: all tokens retargeted from dark "Índigo Profundo" to light **Casa Calma**
  (cream `#f4fafd` bg, forest-green primary `#154212` on legacy var `--color-terracotta`,
  terracotta secondary `#974723` on `--color-amber`, soft shadows, 16px card radius).
  `.glass` is now a plain soft white card (no blur). Legacy token *names* kept everywhere.
- `app/layout.tsx` + `app/manifest.ts`: Plus Jakarta Sans (`--font-jakarta`), light themeColor `#f4fafd`.
- Swept all `bg-white/[0.0x]` glass tints, edge-glint overlays, inline `rgba(13,11,31,…)` nav/modal
  backgrounds, `[color-scheme:dark]` → light equivalents (`bg-card`, `bg-sand`, `border-border`).
- Button secondary restyled to terracotta outline per Casa Calma spec; ghost hover → sand.
- `DESIGN.md` rewritten for Casa Calma; CLAUDE.md design section updated.

Stitch MCP server is configured (`claude mcp add stitch`, key in `~/.claude.json`); screens were
also mirrored to `Chatgpt_Redesign/stitch/` via the API. `Frontend Designs/` is the working copy.

## Known follow-ups
- Screens have only had the token flip — layout alignment to the Stitch mockups happens per stage (F2+).
- Icon buttons/accents using sage/olive/amber/rose tints were retargeted globally; verify per screen.
- PWA icons (`public/icons/`) still show the old dark branding — regenerate in a later stage.
