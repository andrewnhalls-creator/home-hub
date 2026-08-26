# Home Hub — Handoff Document
Updated: 2026-08-26 (Casa Calma redesign — FRONTEND COMPLETE, F1–F12)

## Current state
**The Casa Calma frontend redesign is complete** (stages F1–F12, last commit 203437f).
Source designs: `Chatgpt_Redesign/Frontend Designs/` (36 Stitch screens);
plan: `Chatgpt_Redesign/REDESIGN_PLAN.md`. All 12 stages committed, pushed, and verified
against the live app (mobile + desktop where possible). Build/lint/typecheck green.

Stage summary: F1 tokens/fonts (light Casa Calma, Plus Jakarta Sans) · F2 shell (bottom nav +
FAB + QuickAddSheet, AppDrawer, TopBar, Sidebar) · F3 auth y hogar (login card, 2-step
onboarding, HouseholdSwitchSheet) · F4 Inicio (greeting hero, TodayMealCard, NextUpCards,
AttentionCard) · F5 Compra (grouped categories, Finalizar compra + finishQuickPurchase E2E) ·
F6 Menú/recetas · F7 Recordatorios/tareas · F8 Calendario (month card + inline day panel) ·
F9 Finanzas (Este mes hero, Nuevo Gasto, movimientos, subs summary, presupuestos, deudas) ·
F10 Documentos/deseos · F11 Buscar (fixed results crash)/papelera/actividad · F12 Ajustes.

## Known follow-ups / intentional divergences
- PlanAhorroTab keeps the no-targets model (May rework) — mockup shows targets; needs a
  product decision.
- Papelera has no "Vaciar"/30-day purge; Actividad has no "Nueva Nota" — both need backend.
- PWA icons (`public/icons/`) still old dark branding — regenerate.
- Screens verified with empty data (recetas cards/detail, documentos, deseos, F4 hero cards)
  should be re-checked once real data exists.
- DESIGN_SYSTEM.md deprecated; DESIGN.md is current. UI_REDESIGN_PLAN.md is from the old
  indigo redesign (historical).

## NEXT PHASE: Backend
Follow `Chatgpt_Redesign/HOME_HUB_BACKEND_PROMPT.md` (~45KB spec). Before starting:
read the FULL prompt, inspect repo/schema, produce an implementation plan + schema/module
map (the prompt's "Implementation contract"), then work vertical slices in its delivery-phase
order. Supabase project: xzkavpjwvadqldauaabm. Stitch MCP configured in ~/.claude.json.
