# Design

## Overview

**Palette name:** Aceite de oliva  
**Strategy:** Restrained — clean white surfaces, deep olive primary, wood brown accent. Colour serves orientation and status, not decoration.  
**Scene:** A typical Spanish house — whitewashed walls, olive trees outside, ceramic tile, wooden table. The app should feel like it belongs there.

---

## Color system

All values in OKLCH. Semantic token names map to CSS custom properties in `app/globals.css`.

### Light mode

| Token | OKLCH | Role | Named after |
|---|---|---|---|
| `cream` | `oklch(1.000 0.000 0)` | Page background | Whitewashed wall |
| `sand` | `oklch(0.975 0.012 105)` | Section bg, hover states | Sun-warm stone |
| `card` | `oklch(0.988 0.006 103)` | Card / panel lift above bg | Interior plaster |
| `terracotta` | `oklch(0.40 0.108 110)` | Primary action — buttons, active nav | Shade of olive grove |
| `coral` | `oklch(0.56 0.090 110)` | Hover / lighter primary variant | Olive leaves in light |
| `rose` | `oklch(0.52 0.095 52)` | Accent — wishlist, savings, secondary highlights | Kitchen table (chestnut/walnut) |
| `sage` | `oklch(0.60 0.085 148)` | Chores, success-adjacent | Garden herbs |
| `olive` | `oklch(0.46 0.080 140)` | Dark sage for text-on-sage contexts | Olive leaf underside |
| `amber` | `oklch(0.75 0.140 75)` | Warning, "due soon" | Afternoon sun |
| `brown` | `oklch(0.22 0.022 82)` | Primary body text | Ink on paper |
| `muted` | `oklch(0.52 0.016 88)` | Secondary / helper text | Warm gray stone |
| `border` | `oklch(0.915 0.018 102)` | Subtle separators, card borders | Grout between tiles |

### Semantic status colors

| Token | OKLCH | Notes |
|---|---|---|
| `success` | `oklch(0.62 0.120 148)` | Completed states |
| `warning-text` | `oklch(0.35 0.085 70)` | Text on amber background |
| `danger` | `oklch(0.52 0.185 25)` | Destructive actions, overdue states |

### Dark mode overrides

Dark mode shifts surfaces to warm charcoal (olive-leaning, not blue-cool). Primary and accent lighten to maintain contrast.

| Token | OKLCH dark | Notes |
|---|---|---|
| `cream` | `oklch(0.14 0.015 85)` | Deep warm charcoal bg |
| `sand` | `oklch(0.20 0.018 87)` | Secondary dark surface |
| `card` | `oklch(0.24 0.020 88)` | Card on dark bg |
| `brown` | `oklch(0.93 0.010 95)` | Near-white, warm |
| `muted` | `oklch(0.58 0.014 90)` | Warm mid-gray |
| `border` | `oklch(0.30 0.022 95)` | Subtle olive-dark border |
| `terracotta` | `oklch(0.65 0.095 108)` | Lighter olive for dark bg contrast |
| `coral` | `oklch(0.75 0.080 108)` | Lighter hover on dark |
| `rose` | `oklch(0.68 0.080 52)` | Wood brown lightened for dark |

### Text on filled colors

- **On `terracotta` (olive, L 0.40):** white text — `oklch(1.000 0.000 0)`.
- **On `rose` (wood brown, L 0.52):** white text.
- **On `amber` (L 0.75):** dark text — `warning-text` token.
- **On `sage` (L 0.60):** white text.
- **On `danger` (L 0.52):** white text.

### Module accent identity

Each module uses an existing palette token for quick visual scanning — badges, icons, active indicators:

| Module | Token | Rationale |
|---|---|---|
| Compra | `terracotta` (olive) | Primary module |
| Menú | `sage` | Garden / food |
| Recordatorios | `amber` | Urgency, time |
| Tareas | `olive` | Work, done |
| Calendario | `terracotta` | Same as primary |
| Finanzas | `rose` (wood brown) | Solid, grounded |
| Documentos | `muted` | Neutral, stored |
| Deseos | `rose` (wood brown) | Personal, warm |
| Ajustes | `muted` | Background |

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

**Line height:** `leading-relaxed` for body prose. `leading-snug` for compact list items.  
**Line length:** cap at 65ch for prose; no cap needed for list views.

---

## Spacing & layout

- Base unit: 4px (Tailwind default scale).
- Card padding: `p-4` (16px) default; `p-5` (20px) for richer content cards.
- Page containers: `px-4` mobile, `py-6` vertical breathing room.
- Section gaps: `gap-4` / `gap-6` between cards; `gap-3` within a card's item list.
- Vertical rhythm on pages: `space-y-6`.

---

## Shadows

| Token | Value | Use |
|---|---|---|
| `shadow-card` | `0 1px 3px 0 oklch(0.40 0.108 110 / 0.08), 0 1px 2px -1px oklch(0.40 0.108 110 / 0.06)` | Default card |
| `shadow-card-hover` | `0 4px 12px -1px oklch(0.40 0.108 110 / 0.12), 0 2px 6px -2px oklch(0.40 0.108 110 / 0.08)` | Hovered / active card |
| `shadow-modal` | `0 20px 40px -5px oklch(0.22 0.022 82 / 0.16), 0 8px 16px -6px oklch(0.22 0.022 82 / 0.10)` | Modals, bottom sheets |

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

## Component patterns

### Buttons

- **Primary:** `bg-terracotta text-white` (deep olive, white text). Hover: `coral` lighten. Active: `scale-[0.97]`.
- **Secondary:** `border-terracotta text-terracotta bg-transparent`. Hover: `terracotta/10` fill.
- **Danger:** `border-danger text-danger`. Hover: `danger/10` fill.
- **Ghost:** `text-brown bg-transparent`. Hover: `bg-sand`.
- Min tap target: 44×44px on all sizes.

### Cards

- Background: `card` token (barely lifted from page bg).
- Border: 1px `border-color` token (subtle olive-warm).
- Radius: `rounded-2xl` (`radius-lg`).
- Shadow: `shadow-card` default; `shadow-card-hover` on interaction.
- No nested cards.

### Form inputs

- Background: `card` token.
- Border: `border-color` at rest; `border-terracotta` on focus.
- Focus ring: `ring-2 ring-terracotta` with sufficient contrast offset.
- Radius: `rounded-xl` (`radius-md`).
- Labels always visible above input, never placeholder-as-label.

### Badges / status pills

- Radius: `rounded-full`.
- Sizes: `text-xs font-medium px-2 py-0.5`.
- Text color follows the "text on filled colors" rules above.

### Navigation (mobile)

- Fixed bottom bar, `bg-card` with top border in `border-color`.
- Active item: `text-terracotta` (deep olive icon + label).
- Inactive: `text-muted`.
- Safe area: `pb-[env(safe-area-inset-bottom)]`.

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

Short, warm, Spanish. Never a blank list. Always an icon area (emoji or icon) + one-line message + primary action.

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
