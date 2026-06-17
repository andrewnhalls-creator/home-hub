# Home Hub — Handoff Document
Updated: 2026-06-17 (end of Milestone 17 WIP session)

## Current milestone: 17 — Activity log + soft-delete/archive UI

## Status
- Part A (lib/activity.ts helper): COMPLETE
- Part B (activity writes + restore actions in all action files): COMPLETE, uncommitted
- Part C (Trash/archive UI components + page updates): NOT STARTED

## What is uncommitted (safe, no secrets)
- `lib/activity.ts` — new file, logActivity() helper
- `app/(app)/tareas/actions.ts` — logActivity on create/complete/delete
- `app/(app)/recordatorios/actions.ts` — logActivity on complete/delete; restoreReminder changed to form-action signature
- `app/(app)/calendario/actions.ts` — logActivity on create/delete; new restoreCalendarEvent form-action
- `app/(app)/documentos/actions.ts` — logActivity on create/archive/delete; new restoreDocument + unarchiveDocument form-actions
- `app/(app)/finanzas/actions.ts` — logActivity on all create/delete; new restore form-actions for fixedPayment, expense, savingsGoal, subscription
- `app/(app)/compra/listas/actions.ts` — logActivity on create/archive/delete; new restoreShoppingList + unarchiveShoppingList form-actions

All files passed typecheck before context ran out.

## Already committed this session
- `ec2b787` — Add context budget rules to CLAUDE.md

## Last known good state
- Milestone 16 fully committed and pushed (all settings pages, forgot/reset password, auth callback)
- Dashboard RecentActivity component already exists and queries activity_log; now data is written to it
