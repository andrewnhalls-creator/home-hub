# Next Steps

## Deploy pending
Font + transitions + search (`3a573de`) need deploying:
```
cd /Users/dianezhalls/Projects/home-hub && npx vercel --prod
```

---

## Next: `/papelera` recovery route

A single unified page at `/papelera` where soft-deleted items from all modules can be seen and restored.

### Modules with soft delete (need a restore action each)
- Reminders (`reminders.deleted_at`) → existing `restoreReminder` action exists in `/recordatorios/actions`
- Fixed payments (`fixed_payments.deleted_at`)
- Subscriptions (`subscriptions.deleted_at`)
- Savings goals (`savings_goals.deleted_at`)
- Documents (`household_documents.deleted_at`)

### Plan
1. Check which restore server actions already exist (reminders has one; others may need creating)
2. Create `app/(app)/papelera/page.tsx` — server component, queries all soft-deleted rows in parallel
3. Create `components/papelera/PapeleraView.tsx` — client component, grouped by module with Restaurar buttons
4. Add `/papelera` link to the Menu sheet (MoreMenuSheet) or Ajustes

---

## Remaining post-launch items (in order)
4. **`/papelera` recovery route** ← next
5. Push notification quiet hours / per-category toggles
