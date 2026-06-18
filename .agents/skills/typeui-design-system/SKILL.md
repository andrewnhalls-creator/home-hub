---
name: "glassmorphism-design-system"
description: "Glassmorphism Design System design system for AI coding agents."
metadata:
  author: typeui.sh
  source: workspace-importer
  projectName: "Glassmorphism"
  projectLogoUrl: ""
  importSource: "Manual TypeUI setup"
  primaryColorReference: "#18181b"
  surfaceColorReference: "#ffffff"
  textColorReference: "#09090b"
  typographyScale: "Inter-style sans serif, 12/14/16/20/24/32 scale, medium labels, semibold headings."
  spacingScale: "4px base grid with 8px, 12px, 16px, 24px, and 32px layout steps."
  radiusScale: "6px controls, 8px cards, 12px overlays, nested radii reduced by inner padding."
---

# Design System — Agent Instructions

**Style: Glassmorphism** — a refined, translucent aesthetic inspired by frosted glass surfaces layered over rich, dark atmospheric backgrounds. Surfaces use semi-transparent fills with `backdrop-filter: blur(20px)`, subtle inset edge highlights, and translucent rgba borders to create depth and luminosity. The brand color #8AFFC4 (mint green) provides vibrant accents against deep navy-black backgrounds. Typography uses Google Sans for a clean, modern feel. The result is a premium, ethereal design where glass-like layers float over immersive backgrounds with soft light refractions along edges.

This skill describes the visual design language for all UI output. Every component, layout, and page should follow the design specs in the module files below. These describe *what the design looks like* — you choose how to implement the styles.

## Before Writing Any Code

1. **Read every module that applies.** For a landing page, read at minimum: `layout.md`, `typography.md`, `colors.md`, `buttons.md`, `cards.md`, `shadows.md`, `radius.md`, `borders.md`. Do NOT write JSX until you have loaded all relevant modules.

## Critical Rules

- **Tokens are AGNOSTIC, NOT Tailwind classes:** The tokens defined in the `.md` files (like `neutral-primary-soft`, `heading`, `border-default`) are agnostic design system tokens, NOT literal Tailwind classes. Do not blindly use classes like `bg-neutral-primary-soft` unless you have explicitly mapped them in the CSS/Tailwind configuration. You must implement the mapping yourself.

- **Cross-reference modules.** A card containing buttons must satisfy both `cards.md` AND `buttons.md`.
- **Dark mode is automatic.** The CSS custom properties resolve differently in light/dark via `@media (prefers-color-scheme: dark)`. Never manually swap colors.
- **Every interactive element needs hover, focus, and disabled states** — defined in the relevant module.
- **Use semantic HTML:** proper heading hierarchy (`h1`→`h6`), `<button>` for actions, `<a>` for navigation, ARIA attributes where needed.
- **Glassmorphism surfaces** (cards, modals, sidebars, navbars, accordion, dropdowns) must use glass-bg, glass-blur, glass-border, and glass-shadow tokens from `colors.md`, with edge highlight pseudo-elements from `borders.md`. Note: Always apply `backdrop-filter: blur(20px) !important;` and `-webkit-backdrop-filter: blur(20px) !important;` to ensure the blur isn't overridden by Tailwind defaults.

## Module Index

### Foundation (read first for any UI work)
- [colors.md](colors.md) — all background, text, border, and glass surface tokens
- [typography.md](typography.md) — heading scale, paragraphs, labels, links
- [layout.md](layout.md) — spacing rhythm, containers, animation, visual depth
- [radius.md](radius.md) — border-radius scale
- [shadows.md](shadows.md) — elevation tokens and glass shadows
- [borders.md](borders.md) — border widths, styles, and glass edge highlights

### Components
- [buttons.md](buttons.md) — button variants, sizes, states, glint effect
- [button-group.md](button-group.md) — grouped button structure
- [cards.md](cards.md) — glass card structure, background, interactivity
- [inputs.md](inputs.md) — form controls, labels, states
- [alerts.md](alerts.md) — alert variants
- [badges.md](badges.md) — badge variants, sizes, dismissible chips
- [lists.md](lists.md) — list components
- [avatars.md](avatars.md) — avatar variants, sizes, indicators
- [icon-shapes.md](icon-shapes.md) — icon containers

### Complex Components
- [accordion.md](accordion.md) — glass accordion variants
- [dropdown.md](dropdown.md) — glass dropdown menus
- [modals.md](modals.md) — glass modal dialogs
- [tabs.md](tabs.md) — tab navigation
- [tables.md](tables.md) — table structure
- [pagination.md](pagination.md) — pagination components
- [sidebars.md](sidebars.md) — glass sidebar navigation
- [radios-checkboxes-toggle.md](radios-checkboxes-toggle.md) — selection controls
- [tooltips-popovers.md](tooltips-popovers.md) — tooltips and popovers
- [content.md](content.md) — grid system, responsiveness