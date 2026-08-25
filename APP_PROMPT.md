# Home Hub — App build prompt

Build a complete web application called **Home Hub**. Below is everything about what the app is, who it's for, and what it must do. **I am deliberately giving you no design direction — no colours, themes, layouts, typography, spacing, or component styling. You have full creative freedom over the entire visual design. Surprise me.**

---

## What the app is

Home Hub is a **private, shared household management app** for the members of one home (typically a couple, optionally with family or housemates) to run their household together in one place: shopping lists, weekly menus, recipes, reminders, chores, a shared calendar, a full household finance suite (income, fixed payments, variable expenses, envelope-style budgets with alerts, a mortgage, other debts, savings goals and a savings plan, subscriptions, a household balance, a 30-day cash-flow view, and spending analytics), household documents, a wishlist with member voting, global search, a trash bin for restoring deleted records, an activity log, push notifications, and an AI assistant that turns natural language into app actions.

It is **not** a public or multi-tenant SaaS product. It is invite-only: a household has an owner plus up to 4 invited members (max 5 people). A user can belong to up to 4 households and switch between them. Everything is scoped to the active household and shared between its members — when one person adds or changes something, the others see it in **near-real-time without refreshing**.

## Who uses it

A married couple in Spain managing their home from their phones: adding items to the shopping list during the week, ticking them off in the supermarket, planning the week's meals, splitting chores, tracking what the household earns and spends, watching the mortgage go down, and getting reminded before bills are due. Occasionally other family members or housemates join.

## Language and locale (non-negotiable)

- **Every piece of user-facing text is in Spanish (Spain)** — labels, buttons, validation messages, empty states, navigation, notifications. No English except brand names or unavoidable technical terms.
- Tone of the microcopy: warm, natural, household Spanish — the vocabulary a Spanish couple would actually use at home. Not corporate, not robotic, not machine-translated.
- Locale `es-ES`. Currency: Euro (`€`), formatted with `Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })`.
- Dates `dd/MM/yyyy`. Times 24-hour (`HH:mm`). **Weeks start on Monday everywhere** (menu planner, date pickers, week views).
- Code identifiers (variables, functions, types, files, table/column names) are in English. Only rendered text is Spanish. Route segments and navigation labels are Spanish (e.g. `compra`, `menu`, `recordatorios`, `tareas`, `calendario`, `finanzas`, `documentos`, `deseos`, `buscar`, `papelera`, `actividad`, `ajustes`).

## Tech stack

- Next.js (App Router) + TypeScript + React. Tailwind CSS for styling.
- Supabase (Postgres + Auth + Row Level Security) as the only backend, via `@supabase/supabase-js` + `@supabase/ssr`. Supabase Realtime for live sync between members.
- Zod for validation; `react-hook-form` + `@hookform/resolvers` for forms; `date-fns` with the `es` locale for dates.
- Hosted on Vercel (hosting only). **All scheduled/background processing (reminder scanning, recurring occurrence generation, push delivery) runs on Supabase Edge Functions + Supabase Cron (pg_cron)** — never Vercel cron, which is not reliable enough for reminder timing.
- Installable as a **PWA** (manifest, icons, service worker), with an install-guidance screen. Note: push notifications on iOS require the PWA installed to the home screen (iOS 16.4+) — surface this platform constraint in the UI.
- **AI assistant runs entirely server-side** behind an API route, on a multi-provider router with automatic fallback: Groq → Cloudflare Workers AI → OpenRouter → Gemini (order configurable via an `AI_PROVIDER_ORDER` env var, with per-provider keys/models and timeout/token limits also from env vars). A provider whose env vars are missing is skipped; on rate-limit, timeout, 5xx, or invalid output the router tries the next provider; if all fail, the API returns a safe, friendly error. The app must still build and run with some or all AI env vars absent — validate keys at request time, never at build time. AI provider keys never reach the client.

## Modules and features

### 1. Authentication and household setup
Email/password auth via Supabase Auth: sign up, sign in, forgot/reset password, change password, change email. After signup, a user either **creates a household** or **joins one with an invite code**. Households have an owner; members join by invite code only. A user can create/join up to 4 households and switch the active one. Enforce the 5-member cap per household.

### 2. Dashboard
A home screen that greets the user and summarises the household's current state across modules: today's menu, reminders due, chores pending, upcoming calendar events, next payments due, notification badges, and a recent activity feed. Everything links into its module.

### 3. Shopping list (la compra)
Shared shopping lists organised as weekly shopping trips. Add items quickly (name, optional quantity/note, category), tick them off in the store, and record what the trip actually cost so the household tracks **weekly grocery spend** (planned vs actual per week — trip totals, not per-item prices). Lists can be generated from a planned menu week. Item categories are manageable. Completed lists become spend history that feeds the finance overview.
**Limited offline support (this module only):** cache the last-loaded list and queue completions made offline, syncing on reconnect — so the list still works in a supermarket with bad signal.

### 4. Weekly menu planner (el menú)
Plan meals for each day of the week (week starts Monday), with lunch and dinner slots per day. Assign recipes or free-text meals to slots. Navigate between weeks. From a planned week, push its recipes' ingredients onto the shopping list.

**The shopping list and the menu planner behave as one object viewed two ways.** Both surfaces carry a segmented "Lista ⇄ Semana" toggle so the user flips between the week's meal plan and the shopping list it produces without leaving the screen. The bridge between them is two-way: generating a list from a planned week is the **primary** action on the menu surface, a generated list records which menu week it came from, and from that list the user can jump straight back to its source week. Planning Tuesday's dinner and seeing the items it added should feel like cause and effect on one surface, not two separate destinations.

### 5. Recipes (recetas)
Household recipe collection: name, ingredients (with quantities), steps, servings, tags/categories. CRUD with search/filter. Recipes plug into the menu planner and can send their ingredients to the shopping list.

### 6. Shared reminders (recordatorios)
Reminders visible to the household: title, notes, due date/time, optional recurrence (daily/weekly/monthly/yearly patterns), assignment to a member or the whole household, and completion. Due reminders trigger push notifications.

### 7. Chores (tareas)
Household chores/tasks: one-off and recurring, assignable to members, with due dates and completion tracking. Recurring chores regenerate their next occurrence when completed or on schedule. Keep a **completion history** (who did which chore, when) so effort is visible.

### 8. Calendar (calendario)
A shared household calendar: events with title, date/time (or all-day), optional end, **multi-day events**, location, notes, optional recurrence, and a user-chosen colour/label per event so different kinds of plans are distinguishable. Month/week views (Monday start). Events can trigger reminder notifications.

### 9. Push notifications (core feature, not optional)
Web Push with a service worker and VAPID keys. Per-device subscriptions (a user can have several devices), per-user **notification category preferences** (choose which kinds of notifications to receive), **quiet hours**, and an **in-app notification centre** as history/fallback for users without push. Delivery is scheduled server-side (Supabase Edge Function + Cron scanning for due reminders, payments due, subscription renewals, budget thresholds, expiring documents, events, etc.). Include an optional **month-end recap** notification ("Vuestro resumen de agosto está listo") linking to the finance overview.
**Privacy rule:** notification body text must never contain exact amounts, balances, or other sensitive finance details — use generic phrasing ("Tenéis un pago próximo") and show detail only in-app after login.

### 10. Finance overview (finanzas → resumen)
The finance side is the heart of the app — treat it with the depth of a dedicated budgeting app (think Fintonic or YNAB, minus the bank connections). The overview is a monthly household finance summary bringing everything together:
- **Income vs outgoings** for the month (fixed payments, expenses, subscriptions, mortgage/debt payments, savings contributions) and what's left.
- The household's **current balance** — a manually maintained figure the couple updates, since there are no bank connections.
- A **cash-flow view of the next 30 days**: upcoming fixed payments, subscription renewals, debt/mortgage instalments and expected income, with the projected effect on the balance, so the couple sees what's coming before it hits.
- The household's **net position** (balance + savings − debts − mortgage) and how it evolves month over month.
- **Spending analytics**: totals and charts by category, this month vs last month and vs the same month last year, average monthly spend per category, top categories, and a yearly view (category × month). Insights are always descriptive statistics about the household's own data ("habéis gastado más en súper que el mes pasado"), never financial advice or product recommendations.

Any money movement (income, payment, expense, subscription, savings contribution) can be tagged with a **bank account name** (a free-text label like "BBVA — cuenta común", never a real bank connection) so the couple knows which account each movement goes through, and totals can be viewed per account.

### 11. Income (ingresos)
Household income sources: name (salary, freelance, benefits…), amount, frequency, expected payment day, who receives it, bank account label. Feeds the monthly overview's income total.

### 12. Fixed payments (pagos fijos)
Recurring household bills: name, amount, category, frequency (monthly/quarterly/yearly/etc.), due day, payment method, bank account label, active/archived state. Each occurrence gets a **payment history** entry when marked paid (date, amount actually paid). Upcoming/overdue occurrences are surfaced and can notify.

### 13. Variable expenses (gastos)
Manual entry of one-off household expenses: amount, date, category, note, who paid, bank account label. Entry must be **fast** — a couple of taps from anywhere, because manual-entry apps live or die by friction. When typing a description the app **suggests the category from similar past entries** (e.g. "Mercadona" → Supermercado), always confirmable, never silently applied. Monthly views with totals by category, and a gentle flag when a category is running well above its own recent average. Weekly grocery spend from the shopping module is part of the picture.

### 14. Budgets (presupuestos)
A monthly overall budget plus optional **per-category budgets**, in the spirit of envelope budgeting: the household can allocate its expected monthly income across categories (including savings) so every euro has a destination, with any unallocated remainder visible. Show planned vs actual as the month progresses with a clear sense of pace (how far through the month vs how far through the budget). **Budget alerts**: notify when a category or the overall budget passes a threshold (e.g. 80%) and when it's exceeded — with privacy-safe push wording ("Estáis cerca del límite de un presupuesto"), amounts only in-app. Optionally **roll over** a category's unspent amount to the next month. Budgets are copied forward month to month and editable at any time.

### 15. Savings goals (ahorro)
Goals with a name, target amount, optional deadline, and a log of **contributions** (date, amount, bank account label). Show progress toward each target.

### 16. Savings plan (plan de ahorro)
A monthly savings plan that allocates saving across purposes — e.g. emergency fund, property/investment, and **early mortgage repayment (amortización anticipada)** — and tracks planned vs actual per purpose.

### 17. Mortgage (hipoteca)
Track the household mortgage: lender, original principal, current balance, monthly payment, interest rate, start/end dates, payment day, and status (active / paid off / cancelled). Keep a **monthly payment schedule**: each occurrence has a due date, amount, optional principal/interest breakdown, optional extra payment (pago extraordinario), and a status (pending / paid / skipped), recording who paid and when. Show payoff progress — the balance reduces as payments and extra payments are registered.

### 18. Debts (deudas)
Track other household debts (personal loans, credit cards, money owed): name, lender, current balance, optional monthly payment and payment day, interest rate, notes. Register payments/balance updates so each debt's balance goes down over time, and show the household's **total outstanding debt**.

### 19. Subscriptions (suscripciones)
Track recurring subscriptions (streaming, gym, software…): name, amount, billing frequency and next renewal date, category, bank account label, active/cancelled. Surface upcoming renewals and monthly/annual total cost.

### 20. Household documents (documentos)
Metadata records for important household documents: title, category (insurance, contracts, warranties…), expiry/renewal date, notes, and an optional external URL. **No file upload in v1.** Expiring documents trigger reminders/notifications ahead of the date.

### 21. Wishlist (deseos)
Future purchases the household wants: name, approximate price, priority, link, notes. Members can **vote** on items so the household sees what everyone wants most. Mark as purchased.

### 22. Global search (buscar)
One search box that finds anything across modules — shopping items, recipes, reminders, chores, events, payments, expenses, documents, wishlist items — with results grouped by module and linking straight to the record.

### 23. Trash (papelera)
A recycle bin listing soft-deleted records across modules, showing what was deleted, by whom, and when — with **restore** and (after confirmation) permanent delete.

### 24. AI assistant
A chat-style assistant available throughout the app that turns natural household language into real actions: "añade leche y pan a la compra", "recuérdame pagar el seguro el viernes", "apunta 45 € de gasolina". It interprets the request into a structured action, asks a clarifying question when unsure, shows what it's about to do, and **requires confirmation before executing** anything. It never invents financial data and never acts silently.

It is a **safe command parser, not a general chatbot**: the model must return exactly one structured JSON action from a closed allowlist (add/update/remove shopping item, add/update/complete task, add/update reminder, add expense, and a `clarify` action — extendable module by module), validated with Zod before anything executes. Unknown actions are rejected. Each parsed action carries a confidence score, a `requiresConfirmation` flag, and an optional clarifying question: low-confidence or ambiguous requests (e.g. "añádelo a la lista" with no antecedent) come back as `clarify` rather than a guess, and **destructive or bulk operations always come back with `requiresConfirmation: true`**. Execution reuses the same scoped server actions as the rest of the app — the assistant never bypasses auth, household scoping, or soft-delete rules, and never mutates data through a path the UI couldn't.

### 25. Settings (ajustes)
Household info and members, invite code management, profile, sign out, household switching; sub-pages for **notification preferences**, **connected devices** (push subscriptions per device, with revoke), **category management** (custom categories for shopping/expenses/etc., with archiving), and **privacy/data export** (export household data, e.g. JSON/CSV).

### 26. Activity log (actividad)
Record who did what and when for meaningful changes (finance records, payments, savings, documents, reminders, chores, calendar, shopping lists/spend, notification settings). Show recent activity on the dashboard, a full activity page, and per-record history where it matters.

### 27. Soft delete and archiving
Finance records (income, payments, expenses, budgets), mortgages and mortgage payments, debts, savings goals and plans, documents, calendar events, reminders, and shopping lists/spend history are **soft-deleted** (`deleted_at`/`deleted_by`, plus `archived_at` where archiving applies) — never hard-deleted — and recoverable from the trash. Low-stakes, high-churn records (shopping items, chores, recipes, wishlist items) may hard-delete but always behind a confirmation dialog.

## Optional extras (nice to have, build only if it doesn't compromise the core)

- **Household notice board / messages:** a simple shared space for short notes between members ("he cogido las llaves del coche"), lighter than a full chat app.
- **Shared moments:** attach the occasional photo to things that merit it (a recipe's dish, a finished project) — not a photo-sharing social feed.

## Security and data rules

- Every household-scoped table has **Row Level Security enabled**, restricting access to members of that household (use a shared `is_household_member(household_id)` helper in policies). Nothing is publicly readable.
- The Supabase service-role key, VAPID private key, and any AI-provider key are server-only secrets — never in client code, never committed. Only the Supabase URL, anon key, and VAPID public key are client-safe.
- **No bank integrations ever** — no Open Banking, no transaction import, no connections to real financial institutions. "Bank account" is only ever a free-text label. All finance modules are manual-entry only. No financial/tax/legal advice anywhere in copy or features: this is a household planner, not an accounting product.
- All queries are scoped by `household_id`; never trust a client-supplied household id without membership verification (RLS is the backstop, not the only check).

## Quality bar (every module)

- **Everything is modifiable.** Every record in every module (items, recipes, payments, mortgage details and individual payments, debts, incomes, budgets, goals, contributions, subscriptions, events, categories…) has full CRUD: it can be edited or corrected after creation, not just created and deleted.
- **Totals sum up and balances reduce automatically.** Wherever amounts exist, derived figures stay consistent: expense and subscription totals aggregate by week/month/category, budgets track actuals against plans, savings goal progress is the sum of its contributions, mortgage and debt balances go down as payments/extra payments are registered, and the finance overview reflects all of it. Editing or deleting a record recalculates every total it fed into.
- **Live between members:** a change made by one member appears for the others in near-real-time without a manual refresh.
- Works well on a phone first (~375–390px viewport) — this app lives on phones in kitchens and supermarkets — and scales up to larger screens.
- Every screen has an **empty state, loading state, and error state**. No placeholder buttons that do nothing; no fake demo data.
- Forms use Zod validation with Spanish error messages and `noValidate`; inputs have labels; errors are announced accessibly (`aria-invalid`/`aria-describedby`).
- Destructive actions always have a confirmation step (and land in the trash where soft delete applies).
- Interactive elements are keyboard-operable with visible focus states; tap targets at least 44×44px; icon-only buttons have Spanish `aria-label`s; text contrast meets WCAG AA.

## Explicitly out of scope

Bank connections or CSV import, receipt scanning/OCR, per-item price tracking, full offline sync beyond the shopping list, real-time family **location tracking / safe zones** (not feasible or wanted in a web PWA), a full messenger with voice/video, document file upload, recipe URL import, native mobile apps.

---

Design the app however you think best serves this household — the entire visual identity is yours to invent.
