# Home Hub — Handoff Document
Updated: 2026-06-17 (Milestone 18 complete)

## Current milestone: 19 — Offline support for shopping

## Status
- Milestone 18 (Polish): COMPLETE — committed and pushed

## What was done in Milestone 18
- **Loading states**: Created `PageLoader` component + `loading.tsx` for all 14 dynamic routes (dashboard, tareas, recordatorios, calendario, compra, compra/listas, compra/listas/[id], finanzas, documentos, deseos, menu, menu/recetas, menu/recetas/[id], ajustes)
- **noValidate**: Added missing `noValidate` to CategoriasView edit form
- **Success toasts**: Wired `useToast` into 14 components — all create/update/delete/archive actions now trigger Spanish toast feedback:
  - ChoreList, ChoreCard
  - ReminderList, ReminderCard
  - CalendarView
  - DocumentsList
  - FixedPaymentsTab, ExpensesTab, SavingsTab, SubscriptionsTab
  - WishlistList
  - ShoppingListsOverview, ShoppingList, ShoppingItemCard

## Already done
- Milestone 17: Activity log + TrashSection restore UI (committed)
- Milestone 16: Settings pages, forgot/reset password, auth callback
- All modules: aria-labels on icon buttons, delete confirm modals, EmptyState, Zod validation, Spanish errors

## Last known good state
- Build, lint, typecheck all pass
- Committed and pushed as "Polish UI and validation"
