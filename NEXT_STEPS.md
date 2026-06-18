# Next Steps

## Current state
Features 1–6 complete (2026-06-18). One feature remains before final deploy.

---

## Feature 7 — PDF export for documents / finance summary
**Scope:** larger · preferred approach: browser print stylesheet (no new dependency)

- Two entry points:
  1. Documentos page: "Exportar lista" button → PDF of all current documents with name, category, expiry, notes.
  2. Finanzas ResumenTab: "Exportar resumen" button → PDF of the current month's summary (income, expenses, savings progress).
- Preferred approach: browser print stylesheet (`@media print`) — no new dependency, works on iOS Safari.
  - Add a `PrintWrapper` component that shows only the target content when printing.
  - Hide BottomNav, TopBar, action buttons via `print:hidden`.
- Only adopt `@react-pdf/renderer` if the print stylesheet approach produces unacceptable output.
- Files: `components/ui/PrintWrapper.tsx`, updates to `app/(app)/documentos/page.tsx` and `components/finance/ResumenTab.tsx`.

---

## Deploy checklist (run after Feature 7)
- [ ] Feature 7 complete and manually tested
- [ ] `npm run lint` — 0 errors
- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run build` — succeeds
- [ ] RLS verified on new tables (wishlist votes column, chore_completions)
- [ ] Migrations 020–022 confirmed applied to production ✓ (done this session)
- [ ] Edge Function v8 deployed ✓ (done this session)
- [ ] Commit and push to main → Vercel auto-deploys
