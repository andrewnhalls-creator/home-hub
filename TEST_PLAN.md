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
- [ ] "He olvidado mi contraseña" sends a reset email/flow; the reset link lets the user set a new password and log in with it.
- [ ] "Cambiar contraseña" and "Cambiar correo" from Settings work and require re-authentication where Supabase Auth requires it.

## Shopping module
- [ ] Add an item with name only (minimum fields) succeeds.
- [ ] Add an item with quantity, unit, category, store, priority, notes — all saved and displayed correctly.
- [ ] Edit an existing item updates it in place.
- [ ] Mark an item complete moves it to the completed/collapsed section with `completed_by`/`completed_at` recorded; un-completing reverses it.
- [ ] Delete an item asks for confirmation, then removes it.
- [ ] Filter by category and by store narrows the list correctly.
- [ ] Search finds items by partial name match.
- [ ] Empty list (new household) shows the Spanish empty state, not a blank screen.
- [ ] Create a weekly shopping list (`shopping_lists`); add items to it; mark it "comprada" with an actual total — confirm exactly one linked `expenses` row (category Supermercado) is created, not duplicated on re-save.
- [ ] Add a second `shopping_trips` row (different store) to the same list; confirm the list's effective total reflects both trips.
- [ ] Spend analytics (current week, previous week, monthly, 4-week average, planned vs actual) match the underlying data by hand-calculation on a test household.
- [ ] Archive a shopping list; confirm it's excluded from the default view but reachable via the archived filter; restore it.
- [ ] Simulate offline (e.g. browser dev tools network throttling set to offline): the shopping list remains viewable from cache; ticking an item complete queues the change; reconnecting syncs it without data loss or duplication.

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
- [ ] Creating a reminder with a due date creates a `scheduled_notifications` row with the correct `idempotency_key`; completing or deleting the reminder cancels/removes it.
- [ ] "Posponer 10 minutos" / "Posponer 1 hora" / "Mañana" / "Reprogramar" update the reminder's due time and the corresponding `scheduled_notifications` row without creating a duplicate.
- [ ] Soft-deleting a reminder moves it to the trash view ("Papelera"); "Restaurar" brings it back intact.

## Chores
- [ ] Create a chore with assignee, frequency, next due date.
- [ ] Marking a recurring chore done rolls `next_due_date` forward by the correct interval and resets status.
- [ ] Marking a `puntual` (one-off) chore done simply completes it (no roll-forward).
- [ ] Overdue chores are visually distinguished.
- [ ] Filter by assignee and by status works correctly.
- [ ] Snooze/reschedule actions work the same as reminders.

## Calendar
- [ ] Create a custom event (title, date, time or "Todo el día", repeat frequency, "Avisarme antes", notes).
- [ ] Mark an event "Evento privado" as user A; confirm user B (the partner) cannot see it anywhere (calendar grid, upcoming list, search) — verify via the second test account, not just the UI.
- [ ] Monthly view, weekly view, and "Próximos eventos" all show the same underlying data consistently.
- [ ] Reminders, chores, payment due dates, subscription renewals, document expiry dates, and planned meals all appear on the calendar (read-only from there).
- [ ] A recurring event (diaria/semanal/mensual/anual) correctly expands to the right dates within the visible range.
- [ ] An event with a reminder lead time creates the expected `scheduled_notifications` row.
- [ ] Soft-delete and restore work for calendar events.

## Notifications
- [ ] Enabling push on a device walks through: permission prompt → service worker registration → subscription created → row appears in `push_subscriptions` (only for that user, scoped correctly).
- [ ] "Probar notificación" successfully delivers a test push to that device.
- [ ] Disabling a category in `/ajustes/notificaciones` stops new notifications of that category from being scheduled/sent for that user, without affecting the partner's preferences.
- [ ] Quiet hours suppress delivery during the configured window (the notification still appears in the in-app centre, just not as a push, or is delayed to the window's end — confirm whichever behaviour was implemented matches `PRODUCT_REQUIREMENTS.md`).
- [ ] "Solo lo asignado a mí" filters out notifications for items assigned to the partner.
- [ ] In-app notification centre shows entries even when push delivery is simulated as failing (e.g. an inactive subscription) — the `notification_events` row is still created.
- [ ] "Marcar como leído" / "Marcar todo como leído" update `is_read`/`read_at` correctly and clear the dashboard badge.
- [ ] Deactivating a device from `/ajustes/dispositivos` stops it from receiving further pushes and is reflected immediately in the device list.
- [ ] Multiple devices for the same user can each be enabled/disabled independently.
- [ ] Notification body text for a finance-related notification (payment, subscription) never contains an exact amount — spot-check the generated text against the "privacy-safe notification examples" in `SECURITY_AND_PRIVACY.md`.
- [ ] Re-running the notification scan/send process (simulate by invoking it twice in quick succession) never results in a duplicate push for the same occurrence.

## Finance module
- [ ] Add a fixed payment (name, amount, due day, category, payment method); toggle active/inactive.
- [ ] `payment_instances`: mark an occurrence as paid ("Marcar como pagado"), skip one month ("Omitir este mes"), and override one month's amount ("Cambiar importe solo este mes") without changing the recurring `fixed_payments` definition.
- [ ] Resumen tab figures (upcoming, overdue, paid this month, total fixed this month, total still pending) are computed from `payment_instances`, not just the recurring definitions, and match by hand-calculation.
- [ ] Add a variable expense (title, amount, date, category, paid-by, notes).
- [ ] Add a savings goal (target amount, target date); add a contribution; progress bar and `current_amount` update correctly.
- [ ] Add a subscription (amount, billing cycle, renewal date); renewal-soon highlighting appears when renewal is near.
- [ ] All amounts render as `€` with `es-ES` formatting (e.g. `1.234,56 €`).
- [ ] No bank-related UI, copy, or integration exists anywhere in this module.
- [ ] Soft-deleting a fixed payment, expense, savings goal, or subscription moves it to the trash view; restore works.

## Documents
- [ ] Add a document with title, type, provider, expiry date, renewal date, optional URL, notes.
- [ ] A document nearing its expiry/renewal date is visually flagged and schedules a `documentos`-category notification.
- [ ] Edit and delete (with confirmation) work correctly; archive/restore works.

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
- [ ] `/ajustes/dispositivos`: device list shows both users' devices correctly scoped (a user sees only their own devices, never their partner's); "Revocar acceso"/"Quitar este dispositivo" works.
- [ ] `/ajustes/categorias`: create, rename, recolour, archive a category; a category already in use cannot be hard-deleted from the UI; archiving it doesn't break existing records referencing it (`category_id` is set null or the record keeps showing the archived category's name, per however it was implemented — confirm it degrades gracefully either way).
- [ ] `/ajustes/privacidad`: export JSON (full household data) and CSV (finance, shopping history, documents) downloads succeed and contain the expected data, scoped to the current household only.

## App install guidance
- [ ] "Instalar la app" screen shows correct, distinct instructions for iPhone, Android, Mac, and Windows.
- [ ] The screen correctly explains the iOS install-to-home-screen requirement for push notifications to work there.

## Activity log / dashboard
- [ ] Key actions (item added/completed, reminder created, payment added, goal contribution, wishlist added, etc.) appear in the activity feed with a correct Spanish summary and the correct actor.
- [ ] Dashboard summary cards reflect real counts/data from each module, with correct empty states when a section has no data.

## Row Level Security check (critical)
- [ ] Create a second, unrelated test account that is **not** a member of the household.
- [ ] Confirm that account cannot see any of the household's data via the app (no shopping items, reminders, finance data, etc. leak through).
- [ ] If feasible, attempt a direct Supabase query (e.g. via the SQL editor using the anon key context, or via the REST API as that user) against a household-scoped table and confirm zero rows are returned for a non-member.
- [ ] Confirm `household_invites` codes cannot be listed/enumerated by a non-owner.
- [ ] With both household members logged in (two real accounts, not just one tested twice), confirm user A cannot read or modify user B's `push_subscriptions`, `notification_preferences`, or `notification_events` — these are scoped to `user_id`, not just household membership, and need their own explicit check beyond the standard household-isolation test above.
- [ ] Confirm a private (`is_private = true`) calendar event created by user A is invisible to user B in every view (calendar grid, upcoming list), not just hidden in the primary list.

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
