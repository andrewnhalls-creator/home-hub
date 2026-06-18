# Next Steps

## Current state
Glassmorphism redesign Phase 1 complete (2026-06-18).
Feature 7 (PDF export) paused — resume after redesign phases.

---

## Phase 2 — Core UI components

Apply full glassmorphism treatment to all shared UI primitives.
Follow the `glassmorphism-design-system/` specs strictly for each component.

### Components to rewrite
- `components/ui/Card.tsx` — glass surface: `rgba(255,255,255,0.07)` + `backdrop-filter: blur(20px)` + edge highlights + `radius-xl`
- `components/ui/Button.tsx` — brand (mint), secondary, ghost variants; glint box-shadow; `radius-xl` (20px)
- `components/ui/Input.tsx` — glass input field, translucent bg, `glass-border`
- `components/ui/Textarea.tsx` — same treatment as Input
- `components/ui/Select.tsx` — same treatment as Input
- `components/ui/Modal.tsx` — glass modal with `shadow-xl`, `radius-xl`
- `components/ui/Badge.tsx` — semi-transparent badge variants
- `components/ui/Toast.tsx` — glass toast with colored left border
- `components/ui/EmptyState.tsx` — glass card container, mint accent icon
- `components/ui/Checkbox.tsx` — glass checkbox, mint checked state
- `components/ui/ProgressBar.tsx` — mint fill on dark track

### Key spec rules (from glassmorphism-design-system/)
- Cards: `background: rgba(255,255,255,0.07)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255,255,255,0.12)`, `border-radius: 20px`, edge highlight pseudo-elements
- Buttons: `border-radius: 20px`, glint shadow `var(--shadow-btn)`, brand bg = `#8AFFC4`, text = `#0D0B1F` (dark on mint)
- Inputs: `background: rgba(255,255,255,0.05)`, `border: 1px solid rgba(255,255,255,0.12)`, focus border = `rgba(138,255,196,0.6)`
- All interactive elements: hover, focus, disabled states per spec

---

## Phase 3 — Navigation shell (after Phase 2)
- `components/layout/BottomNav.tsx` — glass bottom bar
- `components/layout/TopBar.tsx` — glass top bar
- `components/layout/AppShell.tsx` — ensure body gradient shows through glass panels
- `components/layout/Sidebar.tsx` — glass sidebar (desktop)
- `components/layout/MoreMenuSheet.tsx` — glass bottom sheet

---

## Feature 7 — PDF export (resume after Phase 5)
**Scope:** browser print stylesheet approach (no new dependency)
- `components/ui/PrintWrapper.tsx` — NEW
- Update `app/(app)/documentos/page.tsx`
- Update `components/finance/ResumenTab.tsx`
