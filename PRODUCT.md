# Product

## Register

product

## Users

A married couple (Andrew and partner), both in Spain, using this daily on their phones and occasionally on a shared tablet. They're not power users hunting for features — they're people who want to manage their shared life without friction. A third household member (shared "home" account on a communal device) may also be present. The audience is up to three people; this is never a public or multi-tenant product.

## Product Purpose

Home Hub is a private household management PWA. It organises everything two people share: shopping lists, weekly menus, recipes, reminders, chores, a calendar, fixed payments, variable expenses, savings goals, subscriptions, household documents, and a wishlist — in one place. Success looks like both people opening it daily because it makes their life easier, not because they feel obligated to maintain it.

## Brand Personality

Calm, personal, clean, trustworthy, efficient. The app should feel like it was made specifically for the two people using it — not a product, a shared space. It opens and you feel settled. Nothing in the way. Warm without being performatively cheerful. Tidy without being sterile. The tone in Spanish is natural and household — "nuestra lista", "esta semana" — not corporate or machine-translated.

## Anti-references

- **Generic task-app aesthetic (Todoist, TickTick):** blue pill buttons, dense lists, pure-productivity feel — the emotional register of work, not home.
- **Corporate finance / banking apps:** cold, transactional, green-heavy. Feels like it belongs at the office.
- **Pastel lifestyle apps:** pasted-on cheerfulness — random gradients, bubbly oversized emoji, hollow joy. Feels insincere.
- **Note / doc tools (Notion, Obsidian dark):** too monochromatic, too editorial. This is a living space, not a knowledge base.

## Design Principles

1. **This is our home, not a dashboard.** Every screen should feel personal and shared, not like enterprise software someone installed. Terminology, tone, and visual warmth should reinforce the domestic context.
2. **Calm efficiency over visual noise.** Features are there when needed, quiet when not. No badges, alerts, or motion fighting for attention. The interface's job is to reduce cognitive load, not add to it.
3. **One-handed, anytime.** Primary use is a phone in one hand while cooking, shopping, or in bed. Tap targets are generous, critical actions are reachable by thumb, and the app works offline for the most common tasks.
4. **Colour earns its place.** Colour serves orientation (which module am I in?) and status (done, overdue, due soon) — not decoration. A surface covered in colour is a surface not using colour meaningfully.
5. **Spanish, always.** Every visible string is natural household Spanish (Spain). The app should feel native to the couple's daily language, not translated.

## Accessibility & Inclusion

- WCAG AA minimum throughout. Body text ≥ 4.5:1 contrast; large/bold text ≥ 3:1.
- All interactive elements keyboard-reachable with visible focus states.
- Minimum 44×44px tap targets on mobile.
- `prefers-reduced-motion` respected: all animations have instant/crossfade alternatives.
- Icon-only buttons always carry Spanish `aria-label`.
- No information conveyed by colour alone.
