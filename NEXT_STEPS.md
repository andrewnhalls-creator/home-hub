# Next Steps

## Current: Milestone 18 — Polish

### 1. Responsive pass
- Check every module page at ~375px mobile width
- Fix layout issues: overflow, wrapping, tap target sizes (min 44×44px)

### 2. Empty / loading / error states
- Verify each module has a proper empty state component (most already have EmptyState)
- Verify loading states are in place (Suspense or loading.tsx per route)
- Toasts for save/delete feedback (check existing toast usage, fill gaps)
- Confirm destructive actions have confirmation dialogs

### 3. Form validation audit
- Every form must have `noValidate` on the `<form>` element
- Every form must use Zod schema + Spanish error messages
- Run through: tareas, recordatorios, calendario, documentos, finanzas (all tabs), compra, deseos, ajustes

### 4. Accessibility pass
- All inputs have associated `<label>` or `aria-label`
- Focus-visible states on all interactive elements
- Icon-only buttons have Spanish `aria-label`
- Colour contrast WCAG AA

### 5. Commit
- `npm run lint && npm run typecheck && npm run build`
- Commit: `Polish UI and validation`
- Push to origin/main

## After Milestone 18: Milestone 19
- Offline support for shopping list (cache items, queue completions, sync on reconnect)
