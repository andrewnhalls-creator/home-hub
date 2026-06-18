# Next Steps

## Current state
Glassmorphism redesign complete — all 5 phases shipped (2026-06-18).

---

## Feature 7 — PDF export

**Scope:** browser print stylesheet approach — no new dependency.

### Files to create / update
- `components/ui/PrintWrapper.tsx` — NEW: wraps a section in a print-only layout, hides nav/chrome
- `app/(app)/documentos/page.tsx` — add a "Exportar PDF" button that triggers `window.print()`
- `components/finance/ResumenTab.tsx` — add same print trigger for finance summary

### Approach
- Add a `@media print` block in `globals.css`: hide `nav`, `.no-print` elements; force white background, black text
- `PrintWrapper` renders its children normally on screen; on print it expands to full page with a clean layout
- No server-side PDF generation — browser print dialog handles it, saves as PDF on all platforms
