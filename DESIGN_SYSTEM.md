# DESIGN_SYSTEM.md — Home Hub

## Brand personality

Calm, warm, trustworthy, a little tactile — like a nicely designed paper planner, not a corporate dashboard. The app should feel personal ("our home"), not generic ("a household management platform"). Friendly without being childish; tidy without being sterile.

## Colour palette

Base palette (Tailwind theme tokens, prefix `homehub-` where useful to avoid clashing with default Tailwind names):

| Token | Hex | Usage |
|---|---|---|
| `cream` | `#FFF7ED` | App background |
| `sand` | `#F5E6D3` | Secondary background / section backgrounds |
| `terracotta` | `#C96B4B` | Primary action colour (buttons, active nav, key accents) |
| `coral` | `#E89A84` | Secondary warm accent, hover/lighter variant of terracotta |
| `sage` | `#A8BFA3` | Secondary accent (e.g. chores, success-adjacent highlights) |
| `olive` | `#7C8F68` | Darker sage variant for text-on-sage or icons |
| `amber` | `#F2C879` | Warning, highlights, "due soon" badges |
| `rose` | `#E8B4B8` | Secondary accent (e.g. wishlist, savings) |
| `brown` | `#5C4033` | Primary heading text colour on light backgrounds |
| `muted` | `#8A7568` | Secondary/muted text, placeholders |

Semantic colours (verify contrast; adjust shade if a pastel fails WCAG AA at the sizes used):

| Semantic | Colour | Notes |
|---|---|---|
| Success | soft green (`#8FB996` or similar, darker than `sage` for text use) | completed states, positive progress |
| Warning | `amber` (`#F2C879`), text in `#7A5B1E` on amber background for contrast | due soon, renewal soon |
| Danger | muted red (`#C1554A`, darker than `coral` for sufficient contrast) | overdue, delete actions, validation errors |
| Info / neutral | `muted` (`#8A7568`) | secondary helper text |

Rules:
- Background is always `cream` or `sand`, never pure white (`#FFFFFF`) as a page background. Cards may use a slightly lighter off-white-warm tone (e.g. `#FFFDF9`) to lift off the page background, with a warm border (`sand`/`muted` at low opacity) rather than a hard shadow-only separation.
- Primary buttons/links use `terracotta`. Never use a cold blue as a primary or dominant colour anywhere.
- Body text is `brown` (not pure black) on light backgrounds for warmth; pure black (`#000000`) is avoided. Where contrast calculation requires a darker tone for accessibility (e.g. small text on amber), darken the specific token rather than defaulting to black.
- Each module can have a light accent identity for quick scanning (not enforced rigidly, used for badges/icons): Compra → terracotta, Menú → sage, Recordatorios → amber, Tareas → olive, Finanzas → rose/terracotta, Documentos → muted/brown, Deseos → rose.

## Typography

- System-first font stack for performance and a clean native feel: `font-sans` (Tailwind default stack: ui-sans-serif, system-ui, etc.) — no heavy custom webfont needed for MVP.
- Type scale (Tailwind defaults are fine): `text-2xl`/`text-3xl` for page titles, `text-lg`/`text-xl` for section/card titles, `text-base` for body, `text-sm` for secondary/meta text, `text-xs` for badges/labels.
- Headings use `font-semibold` or `font-bold` in `brown`; body text `font-normal` in `brown` at slightly reduced opacity or `muted` for secondary copy.
- Line height generous (`leading-relaxed` for body copy) to keep the calm, readable feel.

## Spacing

- Base spacing unit follows Tailwind's default scale (4px increments). Favor generous padding: cards `p-4`/`p-5`, page containers `px-4` on mobile with `py-6`, section gaps `gap-4`/`gap-6`.
- Consistent vertical rhythm between sections (`space-y-6` on a page, `space-y-3` within a card list).

## Card style

- Rounded corners: `rounded-2xl` (large radius for the soft, friendly feel).
- Background: warm off-white (`#FFFDF9`) or `sand` for nested/secondary cards.
- Border: 1px, warm and subtle (`border-[#EADFC8]` or similar), not a hard grey.
- Shadow: soft and subtle (`shadow-sm`, warm-tinted if customised — avoid harsh cool-grey default shadows), used sparingly — borders do most of the separation work.
- Padding: `p-4` to `p-5` depending on content density.

## Button style

- Primary: solid `terracotta` background, white/cream text, `rounded-xl`, `font-medium`, generous padding (`px-4 py-3` minimum for mobile tap target), subtle active/pressed state (slightly darker terracotta).
- Secondary: `sand`/transparent background with `terracotta` or `brown` border and text.
- Destructive: muted red background or red text/border, used only for delete/remove actions, always behind a confirmation step.
- Disabled: reduced opacity, no pointer events.
- Icon buttons: minimum 44×44px hit area even if the visual icon is smaller, `aria-label` always present.
- Standard Spanish button labels: **Añadir, Guardar, Cancelar, Editar, Eliminar, Marcar como hecho, Añadir a la compra, Crear objetivo, Crear recordatorio.**

## Form style

- Inputs: `rounded-xl`, warm border, `bg-[#FFFDF9]`, clear focus ring in `terracotta` at sufficient contrast.
- Labels always visible above the input (no placeholder-as-label pattern), in Spanish, `text-sm font-medium text-brown`.
- Validation errors: `text-sm` in danger colour directly below the field, Spanish messages (see `PHASE 20` examples in `BUILD_PLAN.md`/`CLAUDE.md`): "Este campo es obligatorio.", "Introduce un importe válido.", etc.
- Required fields marked with a subtle asterisk or "(obligatorio)" hint, not relied upon alone — paired with real validation.
- Submit buttons show a loading state (spinner + disabled) while saving; success triggers a toast ("Elemento guardado correctamente.") and either closes the form or resets it.
- Destructive actions (delete) always show a confirmation step: "¿Seguro que quieres eliminarlo?" with explicit Cancelar/Eliminar buttons.

## Navigation

- Mobile (primary target): fixed bottom navigation bar, icon + short Spanish label, active state in `terracotta`, inactive in `muted`. Sections: Inicio, Compra, Menú, Recordatorios, Tareas, Finanzas, Documentos, Deseos, Ajustes. If 9 items is too many for a comfortable bottom bar, group into a primary 5 (Inicio, Compra, Menú, Finanzas, Ajustes) with the rest reachable from Inicio/a "Más" overflow — decide pragmatically during Milestone 3, but never hide a section behind more than one extra tap.
- Desktop/wide viewport: left sidebar with the same sections, full labels, persistent.
- Top bar: current section title, contextual actions (e.g. search/add icon), household name/avatar.

## Mobile layout

- Single column, full-width cards, bottom nav reserves safe-area space (`env(safe-area-inset-bottom)` padding for iOS).
- Sticky/floating primary add action on list screens (e.g. "+" button) reachable by thumb.
- Forms render as full-height pages or bottom sheets, not small centered modals, on narrow viewports.

## Empty states

- Always an icon/illustration-free but friendly short message + a clear primary action, never a bare blank list.
- Standard Spanish empty-state copy: "Todavía no hay elementos.", "Añade el primero para empezar.", "Nada pendiente por ahora.", "Tu semana está lista." — adapted per module context (e.g. shopping: "Todavía no hay productos en la lista. Añade el primero para empezar.").

## Error states

- Inline field errors as described under Form style.
- Page/section-level errors (e.g. failed fetch): a calm card with "No se ha podido cargar esta sección." and a "Reintentar" action — never a raw stack trace or English error.
- Save failures surface via toast: "No se ha podido guardar. Inténtalo de nuevo."

## Accessibility

- Minimum WCAG AA contrast for all text against its background; adjust any pastel token shade that fails at the size/weight used.
- All icon-only controls have Spanish `aria-label`s.
- Focus states always visible (no `outline-none` without a replacement focus style).
- Tap targets minimum 44×44px.
- Form errors linked via `aria-describedby`, invalid fields marked `aria-invalid="true"`.
- Don't rely on colour alone to convey status (e.g. overdue) — pair colour with an icon or text label ("Vencido").

## Component naming

- `components/ui/Button.tsx`, `Card.tsx`, `Input.tsx`, `Select.tsx`, `Modal.tsx`, `EmptyState.tsx`, `Badge.tsx`, `ProgressBar.tsx`, `Toast.tsx` — generic, reusable, no module-specific logic.
- `components/layout/AppShell.tsx`, `BottomNav.tsx`, `TopBar.tsx` — app-wide structural components.
- Module components grouped by feature folder (e.g. `components/shopping/ShoppingItemCard.tsx`, `components/shopping/AddShoppingItemForm.tsx`) — `PascalCase` filenames matching the exported component name, English names, Spanish content within.
