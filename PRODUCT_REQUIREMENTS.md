# PRODUCT_REQUIREMENTS.md — Home Hub

## Product vision

Home Hub is a private, calm, premium-feeling household operating system for a couple. It replaces a scattered mess of WhatsApp messages, sticky notes, spreadsheets, and separate apps (shopping list app, reminders app, a finance spreadsheet) with one shared, mobile-first place where both partners can see and update the same household information in real time.

It should feel like a thoughtfully designed personal organiser made *for this specific household* — not a generic SaaS dashboard, not a spreadsheet with a UI on top.

## Primary users / personas

**Usuario 1 — "Yo" (the household owner who set up the app)**
- Wants a single place to track shared responsibilities instead of repeating things verbally.
- Cares about the app feeling tidy, calm, and pleasant to open daily — not another chore.
- Likely the one who configures categories, invites the partner, and checks in on finances/savings goals.

**Usuario 2 — "Mi pareja" (the invited partner/husband)**
- Joins via an invite code, wants frictionless day-to-day use: ticking off shopping items, marking chores done, checking what's for dinner.
- May use the app more reactively (checking what's needed) than administratively.

Both personas:
- Are not technical power users; copy must be plain, warm, and immediately understandable in natural Spanish.
- Use phones primarily; desktop use is occasional (e.g. planning the week sat at a laptop).
- Trust each other and the app with shared financial and personal household data — privacy of that data from anyone outside the household is paramount.

## Main jobs to be done

1. "Let me know to buy this without having to message you" → shared shopping list.
2. "What are we eating this week, and what do we need to buy for it?" → meal planner + recipes + shopping integration.
3. "Don't let either of us forget X" → shared reminders.
4. "Who's doing the bins / cleaning the bathroom this week?" → chores with assignment and recurrence.
5. "How much are we committed to spending every month, and on what?" → fixed payments + subscriptions overview.
6. "What did we spend this month and on what?" → manual expense tracking.
7. "Are we on track for [holiday / big purchase]?" → savings goals with contributions.
8. "When does the car insurance / passport / rental contract expire?" → household document tracker with expiry alerts.
9. "We want this eventually, let's not forget it and not buy it impulsively either" → wishlist with approval workflow.
10. "What's been happening in the house lately?" → activity log / dashboard summary.

## MVP scope

- Email/password auth via Supabase Auth.
- Household creation and invite-code-based joining (max household size: 2, enforced at the UI/product level even if schema allows more in theory).
- Modules, all with manual CRUD: Shopping, Recipes + Weekly Menu, Reminders, Chores, Fixed Payments, Expenses, Savings Goals (+ contributions), Subscriptions, Documents (metadata only, no file upload), Wishlist.
- Dashboard summarising the above.
- Settings: household info, members, invite code, profile, sign out.
- Basic activity log shown on the dashboard.
- Spanish (Spain) UI throughout, mobile-first, installable as a PWA.
- Deployed and reachable on the public internet (via Vercel) but functionally private (login required, RLS-enforced data isolation).

## Post-MVP scope (explicitly future, not built now)

- Push notifications for reminders/due dates.
- Real-time multi-user presence indicators ("Pareja está editando…").
- File upload for household documents via Supabase Storage.
- Recipe import from a URL.
- Shared calendar view combining reminders, chores, meals, and payments.
- Budgets per category with alerts.
- Data export (CSV/PDF) of expenses.
- Multi-household support per user (e.g. visiting in-laws' household).
- Dark mode.

## Non-goals

- Not a multi-tenant SaaS product for arbitrary households at scale — built for exactly one household (this couple), though the schema generalises to "a household" cleanly.
- Not a bank-connected finance app. No Open Banking, no transaction aggregation, no automatic categorisation of bank transactions.
- Not a tax, legal, or investment advice product.
- Not a recipe-discovery or social cooking platform — recipes are private notes, not a public database.
- Not an offline-first app — requires connectivity; offline fallback is best-effort only (PWA shell, not full offline sync).

## Assumptions

- Exactly two people use a household; UI is designed around "you" and "your partner," not a generic member list.
- Both partners trust each other fully with shared data — there is no concept of private-vs-shared data within a household in MVP.
- The household has one shared currency (EUR) and one shared locale (es-ES).
- Users have a modern smartphone browser supporting PWA installation (iOS Safari or Android Chrome).

## Risks

- **Scope size:** 15 modules is a lot for one MVP; risk of shallow, half-working features. Mitigation: build core CRUD solidly per module rather than adding extra features (notifications, file upload) before the basics work.
- **RLS misconfiguration:** a household app's entire value proposition (privacy between the two of them and no one else) depends on correct RLS. Mitigation: explicit policies per table, verified via Supabase MCP after applying, tested with the second account before considering auth "done."
- **Translation drift:** mixing English and Spanish in the UI undermines the core requirement. Mitigation: treat any English UI string found in review as a bug.
- **Over-engineering finance module:** temptation to build budgeting/analytics beyond manual tracking. Mitigation: stick strictly to the manual-entry scope defined here.

## Success criteria

- Both partners can sign up, create/join the same household, and see each other's changes reflected (after refresh/realtime) within the same session.
- Every module supports create, view, edit, delete (or complete) for its core entity, with Spanish UI throughout and no untranslated strings.
- RLS verified: a third-party Supabase user (or a user not in the household) cannot read or write the household's data.
- App builds and deploys cleanly to Vercel, installable as a PWA on a phone.
- App looks and feels calm and pleasant on a phone screen — not cramped, not corporate.

## Module-by-module requirements

### 1. Authentication and household setup
- Sign up / log in / log out with email + password via Supabase Auth.
- On first login, user has no household → onboarding flow: create a household (name it) or join one via invite code.
- Household owner can generate an invite code (with expiry) from Settings; partner enters it during onboarding to join.
- Route protection: unauthenticated → `/auth/login`; authenticated without household → `/onboarding`; authenticated with household → `/dashboard`.

### 2. Dashboard
- Personalised greeting, current date.
- "This week" summary: pending shopping items count, today/this week's meals, upcoming reminders, pending chores, upcoming fixed payments/subscription renewals, savings goal progress, recent activity feed.
- Clear empty state when a household has no data yet.

### 3. Shopping list
- Add/edit/delete items; mark complete/incomplete; quantity, unit, category, store, priority, notes; filter by category/store/status; search; who added/completed it.

### 4. Weekly menu planner
- Monday–Sunday week view; 4 meal slots/day (desayuno, comida, cena, snack); assign a saved recipe or free-text custom meal; navigate to previous/next week.

### 5. Recipes and ingredients
- Create/edit/delete recipes with name, description, prep time, difficulty, servings, notes, and a list of ingredients (name, quantity, unit, category).
- "Add ingredients to shopping list" action from a recipe or planned meal.

### 6. Shared reminders
- Title, description, due date/time, assigned-to (either partner or unassigned/both), category, repeat frequency, status (pendiente/hecho/vencido); filters (today/week/all/completed).

### 7. Chores and household tasks
- Title, description, assigned-to, frequency, next due date, status; mark done (recurring chores roll forward to next due date); filter by assignee/status; overdue indicator.

### 8. Fixed payments
- Recurring household bills: name, amount, category, due day of month, payment method, active/inactive, notes. Feed into dashboard/finance summary of monthly committed spend.

### 9. Variable expenses
- Manual one-off expense entries: title, amount, date, category, paid-by, notes. Feed into monthly spend summary.

### 10. Savings goals
- Goal name, target amount, current amount, target date, priority, notes; contribution history (amount, date, contributor); progress bar.

### 11. Subscriptions
- Name, amount, billing cycle (mensual/trimestral/anual), renewal date, category, active/inactive; renewal-soon highlighting; included in monthly committed spend.

### 12. Household documents
- Metadata tracker only in MVP (no required file upload): title, type, provider, expiry date, renewal date, optional URL, notes; upcoming-expiry highlighting.

### 13. Wishlist / future purchases
- Name, estimated cost, priority, target month, optional URL, status (idea/aprobado/comprado/descartado), notes.

### 14. Settings
- Household name (owner can edit), member list, generate/view invite code, own profile display name, locale/currency display (read-only, fixed to es-ES/EUR for MVP), sign out.

### 15. Activity log
- Append-only feed of key actions (item added/completed, reminder created, payment added, goal updated, etc.) shown as "recent activity" on the dashboard, in Spanish, attributed to the acting partner.

## Mobile-first UX requirements

- Bottom navigation bar on mobile with the 9 main sections; sidebar nav on wide/desktop viewports.
- All primary actions ("Añadir producto", "Añadir recordatorio", etc.) reachable with the thumb without scrolling, ideally via a prominent floating/sticky add button on list screens.
- Forms open as full-screen mobile sheets/pages, not cramped modals, on small viewports.
- Lists use card-based rows with clear tap targets, not dense spreadsheet-like tables, on mobile.
- Every list view has a friendly, specific empty state (see `DESIGN_SYSTEM.md`) rather than a blank screen.

## Finance scope guardrails (explicit)

- Manual entry only for all finance data — no bank connections, no Open Banking, no automatic transaction import or categorisation.
- No financial, tax, or legal advice anywhere in the product (copy, tooltips, or computed "recommendations").
- Any computed figure (e.g. "disponible estimado") is a simple, transparent arithmetic estimate from data the user entered — never presented as professional advice.
