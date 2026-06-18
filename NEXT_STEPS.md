# Next Steps

## Current state
Impeccable audit + critique complete (2026-06-18). P0/P1 issues resolved in the core UI components and the modules touched during the audit session. Remaining tech debt: modules not yet touched still have Lucide imports, possible `text-[11px]` occurrences, and may have inline `backdrop-filter` that wasn't caught.

---

## Stage: Per-module audit pass

Run a systematic sweep across every module to apply the same fixes that were applied to the core UI during the audit session.

### What to check in each module

1. **Lucide imports** — any `from "lucide-react"` must be migrated to `@phosphor-icons/react` (or `/dist/ssr` for server components)
2. **Sub-12px text** — grep for `text-\[1[01]px\]` and fix to `text-xs` (12px) minimum
3. **Inline `backdrop-filter`** — any `backdropFilter` in inline `style` props on content surfaces (cards, list items, inputs, empty states)
4. **`uppercase tracking-wide` section labels** — replace with `text-xs font-medium text-muted`
5. **`border-white/[0.12]`** — replace with `border-border` for token consistency

### Modules to sweep
- `components/finance/` — KpiChip, TransactionList, PaymentCard, etc.
- `components/meals/` — RecipeCard, WeekGrid (MealSlot already fixed)
- `components/reminders/` — ReminderCard, ReminderForm
- `components/chores/` — ChoreCard, ChoreForm
- `components/calendar/` — EventCard, CalendarGrid
- `components/documents/` — DocumentCard, DocumentForm
- `components/wishlist/` — WishlistCard
- `app/(app)/` pages — any page with ad-hoc glass divs bypassing Card component

### Quick grep commands
```bash
grep -r "lucide-react" components/ app/ --include="*.tsx" -l
grep -r "text-\[1[01]px\]" components/ app/ --include="*.tsx" -l
grep -r "backdropFilter" components/ app/ --include="*.tsx" -l
grep -r "uppercase tracking-wide" components/ app/ --include="*.tsx" -l
grep -r "border-white/\[0.12\]" components/ app/ --include="*.tsx" -l
```

---

## After the module sweep

Run `/impeccable critique` again to get an updated score. Target: ≥30/40 (was 23/40 before the first audit session).
