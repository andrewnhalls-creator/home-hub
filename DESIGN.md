# Design

## Overview

**Palette name:** Índigo Profundo  
**Strategy:** Restrained dark — deep indigo base, saffron gold primary, cool-warm accents. Colour serves orientation and status, not decoration.  
**Scene:** Night-time in a Spanish house. The couple checks tomorrow's groceries before bed. The phone screen is dark, the app is calm and readable, the azulejo tile texture on the background is the only decorative element.  
**Mode:** Dark-first. No light mode in v1 — intentional product decision. Revisit if user research shows daytime kitchen use suffers.

---

## Token naming note

CSS variable names (`--color-terracotta`, `--color-cream`, etc.) are inherited from the original Azulejo design and kept to avoid touching 100+ component files. Their **actual values** are documented below — the names are historical.

---

## Color system

All values in hex. CSS custom properties defined in `app/globals.css`. `globals.css` is the source of truth.

### Color tokens

| Token (CSS var) | Class suffix | Actual value | Role |
|---|---|---|---|
| `--color-cream` | `cream` | `#0D0B1F` | Page background — deep indigo base |
| `--color-sand` | `sand` | `#121130` | Hover states, section bg |
| `--color-card` | `card` | `rgba(255,255,255,0.07)` | Card / panel surface |
| `--color-terracotta` | `terracotta` | `#E8C547` | Primary — buttons, active nav, gold accent |
| `--color-coral` | `coral` | `#D4AE2E` | Hover / darker gold variant |
| `--color-sage` | `sage` | `#2DD4BF` | Teal accent — chores, success-adjacent |
| `--color-olive` | `olive` | `#818CF8` | Indigo accent — secondary highlights |
| `--color-amber` | `amber` | `#FBBF24` | Warning, "due soon" |
| `--color-rose` | `rose` | `#F472B6` | Pink accent — wishlist, savings |
| `--color-brown` | `brown` | `#F0F6FC` | Primary body text (light on dark) |
| `--color-muted` | `muted` | `#94A3B8` | Secondary / helper text |
| `--color-border` | `border` | `rgba(255,255,255,0.12)` | Subtle separators, card borders |
| `--color-success` | `success` | `#009966` | Completed states |
| `--color-danger` | `danger` | `#EF4444` | Destructive actions, overdue states |
| `--color-warning-text` | `warning-text` | `#FBBF24` | Warning text |

### Text on filled colours

- **On `terracotta` (gold `#E8C547`):** dark text — `text-cream` (`#0D0B1F`).
- **On `sage` (teal `#2DD4BF`):** dark text — `text-cream`.
- **On `rose` (pink `#F472B6`):** dark text — `text-cream`.
- **On `amber` (`#FBBF24`):** dark text — `text-cream`.
- **On `danger` (`#EF4444`):** white text — `text-white`.

### Module accent identity

| Module | Token | Rationale |
|---|---|---|
| Compra | `terracotta` (gold) | Primary module |
| Menú | `sage` (teal) | Food / garden |
| Recordatorios | `amber` | Urgency, time |
| Tareas | `olive` (indigo) | Work, done |
| Calendario | `terracotta` (gold) | Same as primary |
| Finanzas | `rose` (pink) | Warm, personal |
| Documentos | `muted` | Neutral, stored |
| Deseos | `rose` (pink) | Personal, warm |
| Ajustes | `muted` | Background |

---

## Surface hierarchy

This project uses a **two-tier glass rule**. Blur is a purposeful material signal, not a universal surface treatment.

| Surface | Treatment | Blur |
|---|---|---|
| Page background | deep indigo + azulejo tile | — |
| Cards / content panels | `rgba(255,255,255,0.07)` opaque | **none** |
| Hover state on cards | `rgba(255,255,255,0.12)` | **none** |
| Fixed nav bars (BottomNav, TopBar) | `rgba(13,11,31,0.80)` | `blur(20px)` |
| Modals / bottom sheets | `rgba(13,11,31,0.85–0.92)` | `blur(24px)` |
| Toasts | `bg-success/[0.08]` or `bg-danger/[0.08]` | `blur(8px)` |
| Modal backdrop overlay | `bg-black/70` | `blur(4px)` |

**Rule:** Never add `backdrop-filter` to content cards, form inputs, empty states, or list items. Blur only on elements that float over other content.

---

## Background

Body background layers (bottom to top):
1. `var(--color-cream)` — deep indigo base `#0D0B1F`
2. Azulejo SVG tile — subtle diamond/cross grid at 40px, `rgba(255,255,255,0.04–0.055)` strokes
3. Depth ellipse radial gradient — `rgba(26,24,71,0.60)` centred ellipse for atmospheric depth

No floating orbs. No positioned accent gradients on body.

---

## Shadows

| Token | Value | Use |
|---|---|---|
| `shadow-card` | `0 8px 32px rgba(0,0,0,0.25), inset highlights` | Default card |
| `shadow-card-hover` | `0 12px 40px rgba(0,0,0,0.35), inset highlights` | Hovered card |
| `shadow-modal` | `0 20px 60px rgba(0,0,0,0.50), inset highlight` | Modals, sheets |
| `shadow-btn` | glow + glint layers | Primary button |
| `shadow-btn-active` | `inset 0 1px 3px rgba(0,0,0,0.35)` | Button pressed |

---

## Typography

**Body:** Nunito (loaded via `next/font/google`, variable `--font-sans`)  
**Display:** Fraunces (loaded via `next/font/google`, variable `--font-display`)  
**Fallback:** `ui-sans-serif, system-ui, sans-serif`

Fraunces is a display serif reserved for hero headings and GreetingCard. Do not use it for UI labels, buttons, or data.

### Scale

| Use | Class | Weight |
|---|---|---|
| Display / hero | `font-display text-3xl` | `font-bold` in `brown` |
| Page title | `text-2xl` | `font-bold` in `brown` |
| Section / card title | `text-lg` | `font-semibold` in `brown` |
| Body | `text-base` | `font-normal` in `brown` |
| Secondary / meta | `text-sm` | `font-normal` in `muted` |
| Badges / labels | `text-xs` | `font-medium` in relevant token |

**Minimum size:** `text-xs` (12px) for all non-decorative text. Never `text-[10px]` or `text-[11px]`.  
**Line height:** `leading-relaxed` for body prose. `leading-snug` for compact list items.

---

## Border radius

| Token | Value | Use |
|---|---|---|
| `radius-sm` | `0.375rem` (6px) | Badges, small controls |
| `radius-md` | `0.5rem` (8px) | Inputs |
| `radius-lg` | `0.75rem` (12px) | Overlays, dropdowns |
| `radius-xl` | `1.25rem` (20px) | Cards, modals, sheets, buttons |
| `radius-full` | `9999px` | Pills, avatar circles |

---

## Spacing & layout

- Base unit: 4px (Tailwind default).
- Card padding: `p-4` (16px) default; `p-5` for richer content cards.
- Page containers: `px-4` mobile, `py-6` vertical breathing room.
- Section gaps: `gap-4` / `gap-6` between cards; `gap-3` within a card's item list.
- Vertical rhythm on pages: `space-y-6`.

---

## Component patterns

### Buttons

- **Primary:** `bg-terracotta text-cream`. Hover: `coral`. Active: `translate-y-px shadow-btn-active`.
- **Secondary:** `bg-white/[0.07] border-terracotta/40 text-terracotta`. Hover: `bg-white/[0.12]`.
- **Danger:** `bg-danger/90 text-white`. Hover: `bg-danger`.
- **Ghost:** `bg-transparent text-brown`. Hover: `bg-white/[0.08]`.
- Min tap target: `min-h-[44px]`.
- Loading spinner: Phosphor `<Spinner>`.

### Cards

- Background: `bg-white/[0.07]` (= `bg-card` token).
- Border: `border-border` (`rgba(255,255,255,0.12)`).
- Radius: `rounded-[var(--radius-xl)]`.
- Shadow: `shadow-card` default; `shadow-card-hover` on interaction.
- Edge highlights: top `h-px` + left `w-px` refraction spans (decorative, `aria-hidden`).
- No `backdrop-filter` on cards.
- No nested cards.

### Form inputs (Input, Select, Textarea)

- Background: `bg-white/[0.06]`.
- Border: `border-white/[0.12]` at rest; `border-terracotta/70` on focus.
- Focus ring: `ring-1 ring-terracotta/50`.
- Radius: `rounded-[var(--radius-xl)]`.
- No `backdrop-filter` on inputs.
- Labels always visible above input.
- `noValidate` on all forms; Zod + react-hook-form for validation.

### Badges / status pills

- Radius: `rounded-full`.
- Sizes: `text-xs font-medium px-2 py-0.5`.

### Navigation — mobile bottom bar

- Fixed, `bg-[rgba(13,11,31,0.80)]` with `blur(20px)` (nav blur is intentional).
- Active item: `text-terracotta`.
- Inactive: `text-muted`.
- Label size: `text-[12px]`.
- Safe area: `pb-[env(safe-area-inset-bottom)]`.

### Toasts

- Floating — `blur(8px)` is appropriate here.
- Success: `bg-success/[0.08] border-success/30`.
- Error: `bg-danger/[0.08] border-danger/30`.
- Icons: Phosphor `CheckCircle weight="fill"` (success) / `WarningCircle weight="fill"` (error).
- No side-stripe border accent.

### Section labels

- Use `text-xs font-medium text-muted` (plain).
- Never `uppercase tracking-wide` for section headings — reserved only for 2-char calendar day abbreviations (Lu, Ma, Mi…).

---

## Icons

**Single library: Phosphor Icons** (`@phosphor-icons/react` v2).  
Default weight: `weight="light"` for UI icons, `weight="fill"` for status indicators.  
Never import from `lucide-react` for new components. Existing Lucide usages in older modules are tech debt — migrate on touch.

---

## Motion

| Name | Duration | Easing | Use |
|---|---|---|---|
| `page-fade-up` | 180ms | `cubic-bezier(0.23, 1, 0.32, 1)` | Page transitions |
| `modal-enter` | 180ms | same | Modals |
| `sheet-enter` | 240ms | `cubic-bezier(0.32, 0.72, 0, 1)` | Bottom sheets |
| `toast-enter` | 200ms | same as modal | Toasts |

**Reduced motion:** `@media (prefers-reduced-motion: reduce)` collapses all durations to `0.01ms` globally.

---

## Empty states

Short, warm, Spanish. Always: icon + one-line message + primary action.

- Generic: "Todavía no hay elementos. Añade el primero para empezar."
- Shopping: "La lista está vacía. ¿Qué necesitáis?"
- Menu: "La semana no tiene menú todavía."
- Reminders: "Sin recordatorios. Todo bajo control."
- Tasks: "Nada pendiente. ¡A descansar!"

---

## Error states

- Field-level: `text-sm text-danger` directly below the field.
- Page-level: card + "No se ha podido cargar esta sección." + "Reintentar".
- Save failure: toast — "No se ha podido guardar. Inténtalo de nuevo."
- Mutation errors must always surface a toast — never silent failure.
