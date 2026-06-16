# TEST_PLAN.md — Home Hub

Manual test checklist. Run the relevant section after building/changing the corresponding module, and run the full list before considering a milestone "done." All checks should be performed in Spanish UI, ideally on a narrow mobile viewport (375–390px wide) as the primary check, with a quick desktop-width pass as secondary.

## Auth and onboarding
- [ ] Sign up with a new email/password creates an account and a `profiles` row.
- [ ] Login with correct credentials succeeds; with incorrect credentials shows a clear Spanish error.
- [ ] Logout clears the session and redirects to `/auth/login`.
- [ ] A freshly signed-up user with no household is redirected to `/onboarding`.
- [ ] Creating a household from onboarding lands the user on `/dashboard` as `owner`.
- [ ] Generating an invite code from Settings produces a unique, time-limited code.
- [ ] A second account joining via a valid invite code becomes a `member` of the same household and immediately sees shared data.
- [ ] An expired or already-used invite code is rejected with a clear Spanish message.
- [ ] Visiting any `/dashboard`/module route while logged out redirects to `/auth/login`.
- [ ] Visiting `/dashboard` while logged in but without a household redirects to `/onboarding`.

## Shopping module
- [ ] Add an item with name only (minimum fields) succeeds.
- [ ] Add an item with quantity, unit, category, store, priority, notes — all saved and displayed correctly.
- [ ] Edit an existing item updates it in place.
- [ ] Mark an item complete moves it to the completed/collapsed section with `completed_by`/`completed_at` recorded; un-completing reverses it.
- [ ] Delete an item asks for confirmation, then removes it.
- [ ] Filter by category and by store narrows the list correctly.
- [ ] Search finds items by partial name match.
- [ ] Empty list (new household) shows the Spanish empty state, not a blank screen.

## Recipes and meal plan
- [ ] Create a recipe with name, description, prep time, difficulty, servings, notes.
- [ ] Add multiple ingredients to a recipe, edit/remove an ingredient.
- [ ] Week view shows Monday through Sunday, correctly ordered, with 4 meal slots per day.
- [ ] Add a custom (non-recipe) meal to a slot.
- [ ] Add a recipe-based meal to a slot; the recipe name displays.
- [ ] Navigate to previous/next week and back; data persists per actual date.
- [ ] "Añadir ingredientes a la compra" from a recipe/planned meal adds all ingredients to the shopping list with sensible category mapping.

## Reminders
- [ ] Create a reminder with title, due date/time, assigned-to, category, repeat frequency.
- [ ] Reminder with a past due date and `pendiente` status renders with overdue styling and `vencido` semantics.
- [ ] Mark a reminder as done updates its status.
- [ ] Filters (hoy/semana/todos/completados) return the expected subsets.

## Chores
- [ ] Create a chore with assignee, frequency, next due date.
- [ ] Marking a recurring chore done rolls `next_due_date` forward by the correct interval and resets status.
- [ ] Marking a `puntual` (one-off) chore done simply completes it (no roll-forward).
- [ ] Overdue chores are visually distinguished.
- [ ] Filter by assignee and by status works correctly.

## Finance module
- [ ] Add a fixed payment (name, amount, due day, category, payment method); toggle active/inactive.
- [ ] Add a variable expense (title, amount, date, category, paid-by, notes).
- [ ] Add a savings goal (target amount, target date); add a contribution; progress bar and `current_amount` update correctly.
- [ ] Add a subscription (amount, billing cycle, renewal date); renewal-soon highlighting appears when renewal is near.
- [ ] Resumen tab totals (monthly fixed payments, this month's expenses, active subscriptions total, savings progress) match the underlying data.
- [ ] All amounts render as `€` with `es-ES` formatting (e.g. `1.234,56 €`).
- [ ] No bank-related UI, copy, or integration exists anywhere in this module.

## Documents
- [ ] Add a document with title, type, provider, expiry date, renewal date, optional URL, notes.
- [ ] A document nearing its expiry/renewal date is visually flagged.
- [ ] Edit and delete (with confirmation) work correctly.

## Wishlist
- [ ] Add an item with name, estimated cost, priority, target month, optional URL.
- [ ] Status transitions idea → aprobado → comprado/descartado work and persist.
- [ ] Filter/sort by priority or status (if implemented) behaves correctly.

## Settings
- [ ] Household name is editable by the owner.
- [ ] Member list shows both household members with correct roles.
- [ ] Invite code can be generated/regenerated and copied.
- [ ] Profile display name is editable and reflected elsewhere (e.g. "Asignado a" pickers, activity log).
- [ ] Sign out works from Settings.

## Activity log / dashboard
- [ ] Key actions (item added/completed, reminder created, payment added, goal contribution, wishlist added, etc.) appear in the activity feed with a correct Spanish summary and the correct actor.
- [ ] Dashboard summary cards reflect real counts/data from each module, with correct empty states when a section has no data.

## Row Level Security check (critical)
- [ ] Create a second, unrelated test account that is **not** a member of the household.
- [ ] Confirm that account cannot see any of the household's data via the app (no shopping items, reminders, finance data, etc. leak through).
- [ ] If feasible, attempt a direct Supabase query (e.g. via the SQL editor using the anon key context, or via the REST API as that user) against a household-scoped table and confirm zero rows are returned for a non-member.
- [ ] Confirm `household_invites` codes cannot be listed/enumerated by a non-owner.

## Spanish UI check
- [ ] Walk every screen and confirm all visible text — labels, buttons, placeholders, empty states, validation/error messages, toasts, navigation — is Spanish (Spain), except brand name ("Home Hub") and unavoidable technical terms.
- [ ] Dates render as `dd/MM/yyyy`, times as 24-hour, currency as `€` with `es-ES` formatting, weeks starting Monday.

## Mobile layout check
- [ ] At ~375px width, every page is usable with no horizontal scroll, no clipped content, and tap targets ≥44×44px.
- [ ] Bottom navigation remains accessible and doesn't overlap content (including safe-area insets on iOS).
- [ ] Forms are easy to fill on a touch keyboard (correct input types, no zoom-jank from small font sizes).

## Vercel build check
- [ ] `npm run lint`, `npm run typecheck`, and `npm run build` all pass locally with no errors before deploying.
- [ ] The Vercel deployment build succeeds; the deployed URL loads the login page and a full auth → dashboard flow works end-to-end against the real Supabase project.
- [ ] Deployment logs (via Vercel MCP) show no runtime errors on first load of each main route.
