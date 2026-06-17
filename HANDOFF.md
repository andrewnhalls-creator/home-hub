# Home Hub — Handoff Document
Updated: 2026-06-17 (Milestone 17 complete)

## Current milestone: 18 — Polish

## Status
- Milestone 17 (Activity log + soft-delete/archive UI): COMPLETE — all parts committed

## What was done in Milestone 17
- Part A: `lib/activity.ts` — `logActivity()` helper
- Part B: logActivity calls + restore server actions in all module action files (tareas, recordatorios, calendario, documentos, finanzas, compra/listas)
- Part C: `components/ui/TrashSection.tsx` — generic collapsible trash/archive section; 5 module pages updated (recordatorios, calendario, documentos, finanzas, compra/listas) to fetch deleted/archived items and render TrashSection

## Last known good state
- All Milestone 17 files committed (WIP commit `811412b` + Part C commit)
- Build, lint, typecheck all pass
- Milestone 16 fully committed and pushed (all settings pages)

## Milestone 18 next tasks
1. Responsive pass on every screen at mobile width (~375px)
2. Loading/empty/error states everywhere; toasts for save/delete feedback; delete confirmations
3. Zod validation + Spanish error messages + `noValidate` on every form — verify still true for all forms since M10
4. Accessibility pass: labels, focus states, contrast, tap target sizes
