# Home Hub — Handoff Document
Updated: 2026-08-25 (Casa Calma redesign — Stage F1 done)

## Current state
A complete redesign is underway based on the Stitch export in `Chatgpt_Redesign/`:
- `Frontend Designs/` — 36 screens (code.html + screen.png each), design system in `casa_calma/DESIGN.md`
- `HOME_HUB_BACKEND_PROMPT.md` — the backend build spec to follow **after** the frontend stages
- `REDESIGN_PLAN.md` — the staged plan (F1–F12 frontend, then backend phases)

**Stage F1 (design-system foundation) is complete.** Build passes, lint 0 errors, typecheck clean.

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
