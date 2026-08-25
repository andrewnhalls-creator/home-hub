# DESIGN.md — Casa Calma

The active design system for Home Hub, adopted 25/08/2026 from the Stitch redesign
(`Chatgpt_Redesign/Frontend Designs/`, spec in `casa_calma/DESIGN.md` there).
It replaces the previous dark "Índigo Profundo" glassmorphism system entirely.
Stage-by-stage adoption is tracked in `Chatgpt_Redesign/REDESIGN_PLAN.md`.

## Brand

A shared household app that feels like a warm, Mediterranean home: grounded, reliable,
nurturing. Minimalism with a tactile touch — organic warmth, generous whitespace, soft
edges, quiet UI. Everything should evoke *tranquilidad* and *confianza*.

- **Light theme only.** Page background is cream `#f4fafd`. Never dark backgrounds.
- **No glassmorphism.** No `backdrop-filter`, no white-alpha tints, no edge glints.
  Depth comes from tonal layers and very soft ambient shadows.

## Tokens (CSS vars in `app/globals.css`)

Legacy token names are kept (historical names from earlier palettes — do not mass-rename);
their values now point at Casa Calma:

| Token | Value | Role |
|---|---|---|
| `--color-cream` | `#f4fafd` | Page background |
| `--color-sand` | `#e8eff1` | Hover fills, recessed wells, section bg |
| `--color-card` | `#ffffff` | Card / nav / modal surface |
| `--color-terracotta` | `#154212` | **Primary action — forest green** |
| `--color-coral` | `#2d5a27` | Primary hover |
| `--color-sage` | `#3b6934` | Calm green accent |
| `--color-olive` | `#6d4820` | Warm earth-brown accent (tertiary) |
| `--color-amber` | `#974723` | **Terracotta secondary accent** |
| `--color-rose` | `#9f1239` | Deep rose accent |
| `--color-brown` | `#161d1f` | Headings / primary ink |
| `--color-muted` | `#42493e` | Secondary text |
| `--color-border` | `#dde4e6` | Hairline borders |
| `--color-success` | `#2d5a27` | Success |
| `--color-danger` | `#ba1a1a` | Error (white text on it) |
| `--color-warning-text` | `#92400e` | Warning text on light bg |

Former glass tokens (`--glass-*`) now describe plain white card surfaces; `.glass`
renders a soft white card with border + ambient shadow, no blur.

## Typography

**Plus Jakarta Sans** everywhere (`--font-jakarta`, loaded in `app/layout.tsx`;
`font-sans` and `font-display` both resolve to it). Weights 400/500/600/700.
Headlines SemiBold/Bold; body 16–18px Regular; labels 14px Medium; micro-labels
12px SemiBold with slight letter-spacing. Generous line heights — Spanish runs long.

## Shape & elevation

- Radii: controls/badges 8px (`--radius-sm`), buttons/inputs 12px (`--radius-md`),
  cards/modals/sheets 16px (`--radius-xl`). No sharp corners.
- Shadows: cards `0 4px 12px rgba(0,0,0,0.04)` (+ 1px border), overlays/modals
  `0 8px 24px rgba(0,0,0,0.08)`. Never heavy black shadows.
- Modal/sheet backdrop: `bg-black/40` with a light 4px blur.

## Layout

8px grid. Mobile-first single column with 20px side margins; 24px between cards.
Desktop: 12-column, 40px margins, sidebar nav. Tap targets ≥ 44×44px.

## Components

- **Button primary:** forest green bg, near-white (`cream`) text.
- **Button secondary:** transparent bg, terracotta (`amber`) text + border.
- **Button ghost:** transparent, ink text, `sand` hover.
- **Inputs/selects:** white bg, `border` hairline, 12px radius, green focus border.
- **Cards:** white, 16px radius, 16px padding, soft shadow.
- **Chips:** pill-shaped, soft pastel tints from the accent palette.
- **Checkboxes:** completed = calm green; errors pair color with an icon.
- **Icons:** Phosphor v2 only (project rule) — rounded, light/regular weights.
  (Stitch mockups show Material Symbols; we map them to Phosphor equivalents.)

## Accessibility

WCAG AA on all pairings: ink `#161d1f` on cream/white passes easily; primary green,
terracotta, danger red all carry white text; muted `#42493e` passes on cream and white.
Keep colored text (sage/amber/rose) at ≥ 14px Medium and verify per surface.
