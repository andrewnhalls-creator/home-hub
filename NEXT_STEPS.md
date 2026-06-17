# Next Steps

## Deploy pending
Font upgrade (`1280922`) needs deploying:
```
cd /Users/dianezhalls/Projects/home-hub && npx vercel --prod
```

---

## Next: Animated page transitions

Top-level route changes (e.g. Inicio → Compra → Finanzas) currently snap with no animation.
Goal: a subtle fade or slide transition between pages that feels native without being heavy.

Approach options to consider at session start:
- **CSS `@view-transitions`** (native browser API, no JS) — simplest, works in Chrome/Safari, graceful degradation in Firefox
- **Framer Motion `AnimatePresence`** — more control, requires adding the package, slightly heavier

Recommended: start with `@view-transitions` (zero-dependency), fall back to Framer Motion only if it proves too limited.

---

## Remaining post-launch items (in order)
2. **Animated page transitions** ← next
3. Global search `/buscar`
4. `/papelera` recovery route
5. Push notification quiet hours / per-category toggles
