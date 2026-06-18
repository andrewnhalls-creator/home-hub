# Design

## Overview

**Palette name:** Azulejo  
**Strategy:** Restrained — warm off-white surfaces, deep clay terracotta primary, warm accents. Colour serves orientation and status, not decoration.  
**Scene:** A typical Spanish house — whitewashed walls, terracotta roof tiles, ceramic tile floors, warm afternoon light. The app belongs there.

---

## Color system

All values in OKLCH. Semantic token names map to CSS custom properties in `app/globals.css`. `globals.css` is the source of truth — this file documents it.

### Light mode

| Token | OKLCH | Role |
|---|---|---|
| `cream` | `oklch(0.972 0.006 86)` | Page background — warm off-white |
| `sand` | `oklch(0.940 0.010 85)` | Hover states, section bg |
| `card` | `oklch(0.999 0.002 90)` | Card / panel lift above bg |
| `terracotta` | `oklch(0.52 0.128 32)` | Primary — buttons, active nav |
| `coral` | `oklch(0.60 0.112 35)` | Hover / lighter primary variant |
| `sage` | `oklch(0.50 0.090 148)` | Chores, success-adjacent |
| `olive` | `oklch(0.42 0.080 140)` | Dark sage for text-on-sage contexts |
| `amber` | `oklch(0.70 0.135 75)` | Warning, "due soon" |
| `rose` | `oklch(0.50 0.095 52)` | Accent — wishlist, savings, secondary highlights |
| `brown` | `oklch(0.20 0.020 82)` | Primary body text |
| `muted` | `oklch(0.44 0.016 86)` | Secondary / helper text — ≥4.5:1 on card |
| `border` | `oklch(0.88 0.012 86)` | Subtle separators, card borders |
| `success` | `oklch(0.50 0.120 148)` | Completed states |
| `warning-text` | `oklch(0.35 0.085 70)` | Text on amber background |
| `danger` | `oklch(0.50 0.185 25)` | Destructive actions, overdue states |

### Dark mode overrides

Dark mode uses warm charcoal surfaces (olive-leaning, not blue-cool). Primary and accents lighten to maintain contrast.

| Token | OKLCH dark |
|---|---|
| `cream` | `oklch(0.17 0.010 62)` |
| `sand` | `oklch(0.23 0.012 64)` |
| `card` | `oklch(0.24 0.018 65)` |
| `terracotta` | `oklch(0.62 0.125 32)` |
| `coral` | `oklch(0.70 0.108 35)` |
| `sage` | `oklch(0.62 0.085 148)` |
| `olive` | `oklch(0.48 0.080 140)` |
| `amber` | `oklch(0.75 0.135 75)` |
| `rose` | `oklch(0.65 0.090 52)` |
| `brown` | `oklch(0.93 0.010 95)` |
| `muted` | `oklch(0.56 0.014 90)` |
| `warning-text` | `oklch(0.92 0.010 80)` |

### Text on filled colors

- **On `terracotta` (L 0.52):** white text.
- **On `sage` (L 0.50):** white text.
- **On `rose` (L 0.50):** white text.
- **On `amber` (L 0.70):** dark text — `warning-text` token.
- **On `danger` (L 0.50):** white text.

### Module accent identity

| Module | Token | Rationale |
|---|---|---|
| Compra | `terracotta` | Primary module |
| Menú | `sage` | Garden / food |
| Recordatorios | `amber` | Urgency, time |
| Tareas | `olive` | Work, done |
| Calendario | `terracotta` | Same as primary |
| Finanzas | `rose` | Grounded, warm |
| Documentos | `muted` | Neutral, stored |
| Deseos | `rose` | Personal, warm |
| Ajustes | `muted` | Background |

### Chart colours (hex — recharts SVG attributes)

Recharts `fill` attributes require hex values. These are hex equivalents of brand tokens:

| Role | Hex | Token |
|---|---|---|
| Bar (monthly) | `#c55535` | terracotta |
| Bar (weekly) | `#42795a` | sage |
| Pie slice 1 | `#c55535` | terracotta |
| Pie slice 2 | `#42795a` | sage |
| Pie slice 3 | `#c99a2e` | amber |
| Pie slice 4 | `#a86040` | rose |
| Pie slice 5 | `#3d6443` | olive |
| Pie slice 6 | `#706d64` | muted |
| Pie slice 7 | `#7a4030` | brown variant |

### Calendar event colours (hex — user-selectable)

| Hex | Name |
|---|---|
| `#c55535` | Terracotta |
| `#d9704e` | Coral |
| `#c99a2e` | Amber |
| `#42795a` | Sage |
| `#3d6443` | Olive |
| `#a86040` | Rose |
| `#7a4060` | Plum |
| `#b03030` | Crimson |

---

## Shadows

| Token | Value | Use |
|---|---|---|
| `shadow-card` | `0 1px 3px 0 oklch(0 0 0 / 0.06), 0 1px 2px -1px oklch(0 0 0 / 0.04)` | Default card |
| `shadow-card-hover` | `0 4px 16px -1px oklch(0 0 0 / 0.09), 0 2px 6px -2px oklch(0 0 0 / 0.06)` | Hovered / active card |
| `shadow-modal` | `0 20px 60px -5px oklch(0 0 0 / 0.14), 0 8px 20px -6px oklch(0 0 0 / 0.08)` | Modals, bottom sheets |
| `shadow-btn` | `0 1px 2px oklch(0 0 0 / 0.08), 0 2px 10px oklch(0.52 0.128 32 / 0.22)` | Primary button glow |
| `shadow-btn-active` | `inset 0 1px 3px oklch(0 0 0 / 0.15)` | Button pressed state |

---

## Typography

**Primary:** Plus Jakarta Sans (loaded via `next/font/google`, variable `--font-jakarta`)  
**Fallback stack:** `ui-sans-serif, system-ui, sans-serif`

### Scale

| Use | Class | Weight |
|---|---|---|
| Page title | `text-2xl` / `text-3xl` | `font-bold` in `brown` |
| Section / card title | `text-lg` / `text-xl` | `font-semibold` in `brown` |
| Body | `text-base` | `font-normal` in `brown` |
| Secondary / meta | `text-sm` | `font-normal` in `muted` |
| Badges / labels | `text-xs` | `font-medium` in relevant token |

**Minimum size:** `text-xs` (12px) for all non-decorative text. Never `text-[10px]` or `text-[11px]`.  
**Line height:** `leading-relaxed` for body prose. `leading-snug` for compact list items.  
**Line length:** cap at 65ch for prose; no cap for list views.

---

## Border radius

| Token | Value | Use |
|---|---|---|
| `radius-sm` | `0.5rem` | Badges, inputs, small elements |
| `radius-md` | `0.75rem` | Buttons |
| `radius-lg` | `1rem` | Cards |
| `radius-xl` | `1.25rem` | Modals, bottom sheets |
| `radius-full` | `9999px` | Pills, avatar circles |

---

## Spacing & layout

- Base unit: 4px (Tailwind default scale).
- Card padding: `p-4` (16px) default; `p-5` (20px) for richer content cards.
- Page containers: `px-4` mobile, `py-6` vertical breathing room.
- Section gaps: `gap-4` / `gap-6` between cards; `gap-3` within a card's item list.
- Vertical rhythm on pages: `space-y-6`.

---

## Component patterns

### Buttons

- **Primary:** `bg-terracotta text-white`. Hover: `coral` lighten. Active: `scale-[0.97]` + `shadow-btn-active`.
- **Secondary:** `border-terracotta text-terracotta bg-transparent`. Hover: `terracotta/10` fill.
- **Danger:** `border-danger text-danger`. Hover: `danger/10` fill.
- **Ghost:** `text-brown bg-transparent`. Hover: `bg-sand`.
- Min tap target: 44×44px.

### Cards

- Background: `card` token.
- Border: 1px `border-color`.
- Radius: `rounded-2xl`.
- Shadow: `shadow-card` default; `shadow-card-hover` on interaction.
- No nested cards.

### Form inputs

- Background: `card` token.
- Border: `border-color` at rest; `border-terracotta` on focus.
- Focus ring: `ring-2 ring-terracotta`.
- Radius: `rounded-xl`.
- Placeholder: `text-muted` — must maintain ≥4.5:1 contrast on card bg.
- Labels always visible above input, never placeholder-as-label.

### Badges / status pills

- Radius: `rounded-full`.
- Sizes: `text-xs font-medium px-2 py-0.5`.
- Text color follows "Text on filled colors" rules above.

### Navigation (mobile)

- Fixed bottom bar, `bg-card` with top border in `border-color`.
- Active item: `text-terracotta`.
- Inactive: `text-muted`.
- Safe area: `pb-[env(safe-area-inset-bottom)]`.

### Section labels

- Use `text-xs font-medium text-muted` (plain, no `uppercase tracking-wide`).
- `uppercase tracking-wide` is reserved only for 2-char calendar day abbreviations (Lu, Ma, Mi…) where tracking aids readability.

---

## Motion

All animation tokens are in `app/globals.css`. Key keyframes:

| Name | Duration | Easing | Use |
|---|---|---|---|
| `page-fade-up` | 180ms | `cubic-bezier(0.23, 1, 0.32, 1)` | Page route transitions |
| `modal-enter` | 180ms | Same | Modals |
| `sheet-enter` | 240ms | `cubic-bezier(0.32, 0.72, 0, 1)` | Bottom sheets |
| `toast-enter` | 200ms | Same as modal | Toast notifications |
| `tab-enter` | 160ms | Same as modal | Tab panel switches |
| `stagger-list` | 220ms + delay | Same as modal | List item entrance |

**Reduced motion:** `@media (prefers-reduced-motion: reduce)` collapses all durations to `0.01ms` globally.  
**Rule:** reveal animations must never gate content visibility — items are visible by default, animation enhances.

---

## Empty states

Short, warm, Spanish. Never a blank list. Always: icon area + one-line message + primary action.

Standard copy per context:
- Generic: "Todavía no hay elementos. Añade el primero para empezar."
- Shopping: "La lista está vacía. ¿Qué necesitáis?"
- Menu: "La semana no tiene menú todavía."
- Reminders: "Sin recordatorios. Todo bajo control."
- Tasks: "Nada pendiente. ¡A descansar!"

---

## Error states

- Field-level: `text-sm text-danger` directly below the field. Never raw stack traces.
- Page-level: calm card, "No se ha podido cargar esta sección." + "Reintentar".
- Save failure: toast, "No se ha podido guardar. Inténtalo de nuevo."
