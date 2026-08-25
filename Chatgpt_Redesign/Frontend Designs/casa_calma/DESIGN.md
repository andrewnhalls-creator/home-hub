---
name: Casa Calma
colors:
  surface: '#f4fafd'
  surface-dim: '#d4dbdd'
  surface-bright: '#f4fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef5f7'
  surface-container: '#e8eff1'
  surface-container-high: '#e2e9ec'
  surface-container-highest: '#dde4e6'
  on-surface: '#161d1f'
  on-surface-variant: '#42493e'
  inverse-surface: '#2b3234'
  inverse-on-surface: '#ebf2f4'
  outline: '#72796e'
  outline-variant: '#c2c9bb'
  surface-tint: '#3b6934'
  primary: '#154212'
  on-primary: '#ffffff'
  primary-container: '#2d5a27'
  on-primary-container: '#9dd090'
  inverse-primary: '#a1d494'
  secondary: '#974723'
  on-secondary: '#ffffff'
  secondary-container: '#ff996e'
  on-secondary-container: '#772f0c'
  tertiary: '#52320b'
  on-tertiary: '#ffffff'
  tertiary-container: '#6d4820'
  on-tertiary-container: '#ecb987'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bcf0ae'
  primary-fixed-dim: '#a1d494'
  on-primary-fixed: '#002201'
  on-primary-fixed-variant: '#23501e'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb598'
  on-secondary-fixed: '#370e00'
  on-secondary-fixed-variant: '#79300e'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#f0bd8b'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#623f18'
  background: '#f4fafd'
  on-background: '#161d1f'
  surface-variant: '#dde4e6'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
---

## Brand & Style
The design system is built for a shared household management experience that feels like a digital extension of a warm, Mediterranean home. The brand personality is grounded, reliable, and nurturing, specifically tailored for a Spanish family dynamic where coordination should feel like a conversation rather than a chore.

The aesthetic leans into **Minimalism** with a **Tactile** touch. It avoids the coldness of traditional SaaS by using organic warmth, generous whitespace, and soft edges. Every interaction should evoke a sense of "tranquilidad" (tranquility) and "confianza" (trust). The UI is intentionally quiet to reduce cognitive load, ensuring that even a busy multi-generational household can navigate it effortlessly.

## Colors
The palette is inspired by the natural landscapes of Spain—combining the deep greens of northern forests with the earthy terracotta of southern architecture.

- **Primary (Forest Green):** Used for main actions, high-level navigation, and "done" states. It represents stability and growth.
- **Secondary (Terracotta):** Used for highlighting collaborative features, reminders, and secondary touchpoints.
- **Background (Cream):** A soft, off-white base that reduces eye strain compared to pure white, creating a "paper-like" warmth.
- **Neutral (Slate):** All text uses a deep slate to maintain high legibility while appearing softer than pure black.

All color combinations must adhere to **WCAG AA** standards, ensuring that text on the cream background remains highly accessible for all family members, including seniors.

## Typography
This design system utilizes **Plus Jakarta Sans** for its friendly, open apertures and modern geometric character. It provides the perfect balance between professional organization and approachable warmth.

- **Headlines:** Use Bold or SemiBold weights to create a clear visual hierarchy. Spanish text can often be longer than English; ensure line heights are generous to prevent descenders from touching.
- **Body Text:** Set primarily in the Regular weight at 16px or 18px to ensure ease of reading for shopping lists and shared calendars.
- **Micro-copy:** Use the Medium weight for labels and captions to maintain legibility at smaller sizes.

## Layout & Spacing
The layout follows an **8px grid system** to maintain mathematical harmony while allowing for generous whitespace. 

- **Fluidity:** On mobile devices, use a single-column layout with 20px side margins. On tablet and desktop, move to a 12-column grid to allow for side-by-side modules (e.g., Calendar next to Shopping List).
- **Rhythm:** Use `lg` (24px) spacing between distinct cards or sections to create "breathing room," preventing the interface from feeling cluttered or overwhelming.
- **Touch Targets:** All interactive elements (buttons, checkboxes, list items) must have a minimum hit area of **44x44px** to accommodate users of all ages and dexterity levels.

## Elevation & Depth
Depth is created through **Tonal Layers** and extremely soft, ambient shadows. 

1. **Level 0 (Base):** The Cream background (#FDFCF8).
2. **Level 1 (Cards):** Pure White (#FFFFFF) surfaces with a subtle 1px border (#EBE9E0) or a very soft shadow (Y: 4, Blur: 12, Opacity: 4% Black). 
3. **Level 2 (Overlays/Modals):** Floating elements used for adding new tasks or events. These use a slightly more pronounced shadow (Y: 8, Blur: 24, Opacity: 8% Black) to indicate they sit above the main content.

Avoid heavy black shadows or high-contrast inner glows. The goal is to make elements look like they are gently resting on a surface, not floating in deep space.

## Shapes
The shape language is defined by large, inviting radii that feel organic and safe. 

- **Buttons & Inputs:** Use a 12px radius (`rounded-md/lg` equivalent) for a modern, friendly feel.
- **Cards & Containers:** Use a 16px radius (`rounded-xl`) to define the primary content areas. 
- **Icons:** Use rounded caps and joins to match the soft aesthetic of the typography.

Avoid any sharp corners, as they conflict with the "Calm Home" narrative.

## Components
- **Buttons:** 
  - *Primary:* Forest Green background, White text. High contrast and authoritative.
  - *Secondary:* Terracotta border and text, no background. Used for less critical actions like "Añadir comentario."
- **Inputs:** Large text fields with 12px rounded corners and a soft 1px slate-tinted border. The active state should use a Forest Green border with a 2px thickness.
- **Cards:** White background with 16px padding and 16px corner radius. Used for individual chores, grocery items, or calendar events.
- **Chips:** Small, 100px-pill-shaped labels used for tagging family members (e.g., "Papá", "Elena"). Each family member can be assigned a subtle pastel tint from the secondary or tertiary palettes.
- **Lists:** Clean rows with 16px vertical padding. Use "Success" Sage Green for completed task checkboxes to provide a calming sense of accomplishment.
- **Feedback:** Use soft Crimson for error states, but ensure the icons (like a warning triangle) are present to support users with color-vision deficiencies.