# Next Steps

## Deploy pending
Font + transitions (`a1169ca`) need deploying:
```
cd /Users/dianezhalls/Projects/home-hub && npx vercel --prod
```

---

## Next: Global search `/buscar`

A global search page that queries across all modules from one input.

### Scope
- Route: `app/(app)/buscar/page.tsx`
- Input at top, results grouped by module (Compra, Recordatorios, Tareas, Finanzas, Documentos, Deseos, Menú)
- Each result row shows title + module label + taps to that item's page
- No dedicated nav item needed — accessible from the top bar search icon (if present) or as a standalone page

### Data approach
- Single Supabase query per module (shopping_items, reminders, chores, fixed_payments, subscriptions, household_documents, wishlist_items, recipes) filtered by `household_id` and `ilike` on the name/title column
- Run in parallel with `Promise.all`
- Minimum 2 characters before searching (debounced or on submit)

### UI
- Empty state: prompt to type something
- Zero results state: "Sin resultados para «X»"
- Loading state: skeleton rows per section
- Group results under section headers with module icons

---

## Remaining post-launch items (in order)
3. **Global search `/buscar`** ← next
4. `/papelera` recovery route
5. Push notification quiet hours / per-category toggles
