# Next Steps

## Immediate next task: Milestone 17 Part C — Trash/archive UI

### 1. Create `components/ui/TrashSection.tsx`
Generic reusable client component. Pattern:
- `TrashRow` sub-component: holds `useActionState(restoreAction, {})`, renders item label + sublabel + form with `<input type="hidden" name="id" value={item.id} />` + "Restaurar" submit button
- `TrashSection` component: collapsible section with toggle button, title, list of TrashRow components
- Props: `title`, `items: Array<{ id, label, sublabel?, deletedAt }>`, `restoreAction: (_prevState: { error?: string }, formData: FormData) => Promise<{ error?: string }>`

### 2. Update module pages (fetch deleted/archived, render TrashSection)
- `app/(app)/recordatorios/page.tsx` — fetch `deleted_at is not null` reminders; render TrashSection below ReminderList using `restoreReminder`
- `app/(app)/finanzas/page.tsx` — fetch deleted records per type; render TrashSection per tab using respective restore actions
- `app/(app)/calendario/page.tsx` — fetch deleted events; render TrashSection using `restoreCalendarEvent`
- `app/(app)/documentos/page.tsx` — fetch archived (deleted_at null + archived_at not null) AND deleted separately; render ArchiveSection + TrashSection using `unarchiveDocument` / `restoreDocument`
- `app/(app)/compra/listas/page.tsx` — fetch archived + deleted lists; render archive + trash sections using `unarchiveShoppingList` / `restoreShoppingList`

### 3. Finish Milestone 17
- Run `npm run lint` and `npm run typecheck`
- Commit all Milestone 17 changes
- Update HANDOFF.md and NEXT_STEPS.md
- Push to origin/main

## After Milestone 17: Milestone 18
See BUILD_PLAN.md for details.
