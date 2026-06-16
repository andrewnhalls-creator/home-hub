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

## MVP scope (v1)

- Email/password auth via Supabase Auth, including forgot/reset password, change password, change email.
- Household creation and invite-code-based joining (max household size: 2, enforced at the UI/product level even if schema allows more in theory).
- Modules, all with manual CRUD: Shopping (with weekly shopping lists + spend tracking), Recipes + Weekly Menu, Reminders, Chores, **Calendar**, Fixed Payments (with per-occurrence payment history), Expenses, Savings Goals (+ contributions), Subscriptions, Documents (metadata only, no file upload), Wishlist.
- **Push notifications (Web Push)** — core v1 feature, not optional. Service worker, VAPID, per-device subscriptions, per-user category preferences, quiet hours, in-app notification centre as a fallback/history view, scheduled delivery driven by Supabase (Edge Function + Supabase Cron), never by Vercel cron. See "Notifications" module below.
- Dashboard summarising the above, with notification badges.
- Settings: household info, members, invite code, profile, sign out, notification preferences (`/ajustes/notificaciones`), connected devices (`/ajustes/dispositivos`), category management (`/ajustes/categorias`), data export (`/ajustes/privacidad`).
- Activity log / audit trail shown on the dashboard and per-record where it matters (finance, payments, savings goals, documents, reminders, chores, calendar events, shopping lists/spend, notification settings).
- Soft delete (not hard delete) for finance records, payments, savings goals, documents, calendar events, reminders, and shopping lists/spend history — see "Soft delete and archiving" below.
- App-install guidance screen explaining push notification platform requirements (iOS/Android/desktop).
- Spanish (Spain) UI throughout, mobile-first, installable as a PWA.
- Deployed and reachable on the public internet (via Vercel) but functionally private (login required, RLS-enforced data isolation).
- Limited offline support for the shopping list only (cache last-loaded items, queue completions made offline, sync on reconnect) — not full offline sync for every module.

See "Priority clarification" below for the authoritative v1-vs-post-MVP split.

## Post-MVP scope (explicitly future, not built now)

- Real bank connections, Open Banking, or bank CSV import (never — see `SECURITY_AND_PRIVACY.md`).
- Receipt scanning / OCR.
- Item-level shopping price tracking (v1 tracks list/trip totals only, not per-item prices).
- Full offline sync for every module (v1 only caches the shopping list).
- Global search (`/buscar`) across modules — designed for in the data model, not built in v1.
- Real-time multi-user presence indicators ("Pareja está editando…").
- File upload for household documents via Supabase Storage (v1 stores an optional external URL only).
- Recipe import from a URL; pasted-text import for recipes/shopping items/expenses.
- Budgets per category with alerts (beyond the simple planned-vs-actual shopping comparison already in v1).
- Multi-household support per user (e.g. visiting in-laws' household).
- Dark mode.
- Native iOS/Android apps.
- AI meal suggestions, advanced charts.

## Non-goals

- Not a multi-tenant SaaS product for arbitrary households at scale — built for exactly one household (this couple), though the schema generalises to "a household" cleanly.
- Not a bank-connected finance app. No Open Banking, no transaction aggregation, no automatic categorisation of bank transactions.
- Not a tax, legal, or investment advice product.
- Not a recipe-discovery or social cooking platform — recipes are private notes, not a public database.
- Not an offline-first app — requires connectivity; offline fallback is best-effort only (PWA shell, not full offline sync).

## Assumptions

- Exactly two people use a household; UI is designed around "you" and "your partner," not a generic member list.
- Both partners trust each other fully with shared data — there is no concept of private-vs-shared data within a household in MVP, **except** calendar events, which may be marked "evento privado" (visible only to their creator) since a personal calendar entry (e.g. a surprise, a solo appointment) is a reasonable exception to the otherwise fully shared model.
- The household has one shared currency (EUR) and one shared locale (es-ES).
- Users have a modern smartphone browser supporting PWA installation (iOS Safari or Android Chrome).

## Risks

- **Scope size:** the module count grew substantially with calendar, notifications, payment history, and shopping spend tracking. Risk of shallow, half-working features. Mitigation: build core CRUD solidly per module before adding the next; follow the "Definition of done" checklist (`CLAUDE.md`) for every module; follow the explicit phase order in `BUILD_PLAN.md`.
- **RLS misconfiguration:** a household app's entire value proposition (privacy between the two of them and no one else) depends on correct RLS. This now extends to push subscriptions and notification data, which must never leak between users even within the same household. Mitigation: explicit policies per table, verified via Supabase MCP after applying, tested with the second account before considering auth "done."
- **Translation drift:** mixing English and Spanish in the UI undermines the core requirement. Mitigation: treat any English UI string found in review as a bug.
- **Over-engineering finance module:** temptation to build budgeting/analytics beyond manual tracking. Mitigation: stick strictly to the manual-entry scope defined here.
- **Notification infrastructure complexity:** Web Push + service worker + Supabase Cron/Edge Functions is the most technically complex part of v1. Mitigation: build it in the explicit incremental order in `BUILD_PLAN.md` (tables → in-app centre → service worker → permission flow → subscription storage → test notification → scheduled Edge Function), and never send sensitive finance details in a push body.
- **Double-counting grocery spend:** shopping spend (from `shopping_lists`/`shopping_trips`) and the `expenses` table could both record the same spend. Mitigation: a single linking column (`expenses.shopping_list_id`, unique where set) and one documented source-of-truth rule — see `DATA_MODEL.md`.

## Success criteria

- Both partners can sign up, create/join the same household, and see each other's changes reflected (after refresh/realtime) within the same session.
- Every module supports create, view, edit, delete (or complete) for its core entity, with Spanish UI throughout and no untranslated strings.
- RLS verified: a third-party Supabase user (or a user not in the household) cannot read or write the household's data.
- App builds and deploys cleanly to Vercel, installable as a PWA on a phone.
- App looks and feels calm and pleasant on a phone screen — not cramped, not corporate.

## Module-by-module requirements

### 1. Authentication and household setup
- Sign up / log in / log out with email + password via Supabase Auth.
- Forgot password / reset password / change password / change email ("He olvidado mi contraseña", "Restablecer contraseña", "Cambiar contraseña", "Cambiar correo"). No MFA in v1; document recovery notes only.
- On first login, user has no household → onboarding flow: create a household (name it) or join one via invite code.
- Household owner can generate an invite code (with expiry) from Settings; partner enters it during onboarding to join.
- Route protection: unauthenticated → `/auth/login`; authenticated without household → `/onboarding`; authenticated with household → `/dashboard`.
- Device/session management at `/ajustes/dispositivos` ("Dispositivos", "Sesiones activas", "Último acceso", "Revocar acceso", "Quitar este dispositivo") — shows each device's push-notification subscription status alongside session info; deactivating a device also deactivates its push subscription.

### 2. Dashboard
- Personalised greeting, current date.
- "This week" summary: pending shopping items count, today/this week's meals, upcoming reminders, pending chores, upcoming/overdue payments (from `payment_instances`), subscription renewals, savings goal progress, upcoming calendar events, recent activity feed.
- Notification badges (unread count from the in-app notification centre).
- Clear empty state when a household has no data yet.

### 3. Shopping list
- Add/edit/delete items; mark complete/incomplete; quantity, unit, category, store, priority, notes; filter by category/store/status; search; who added/completed it.
- **Weekly shopping lists (`shopping_lists`):** a list represents one week/shopping session with a status (`borrador`/`activa`/`comprada`/`archivada`), optional planned budget, and an actual total. Items optionally belong to a list (`shopping_items.shopping_list_id`); ungrouped items remain supported for quick one-off adds.
- **Weekly spend tracking:** record the actual total per list (manual entry in v1) or per `shopping_trips` row (one row per store visited for that list — e.g. Mercadona €84.20, Carrefour €23.10). Item-level prices are explicitly out of scope for v1.
- **Spend analytics** on `/compra` and the finance summary: current week total, previous week total, monthly grocery spend, 4-week average, planned-vs-actual, store breakdown (when trips are used).
- Marking a list "comprada" with a total creates (or links to) exactly one `expenses` row in the "Supermercado" category — see `DATA_MODEL.md` for the no-double-counting rule.
- Offline behaviour: the shopping list view caches the last-loaded items; ticking an item complete while offline queues the change and syncs on reconnect ("Sin conexión", "Los cambios se sincronizarán cuando vuelva la conexión", "Lista guardada en este dispositivo").

### 4. Weekly menu planner
- Monday–Sunday week view; 4 meal slots/day (desayuno, comida, cena, snack); assign a saved recipe or free-text custom meal; navigate to previous/next week.

### 5. Recipes and ingredients
- Create/edit/delete recipes with name, description, prep time, difficulty, servings, notes, and a list of ingredients (name, quantity, unit, category).
- "Add ingredients to shopping list" action from a recipe or planned meal.

### 6. Shared reminders
- Title, description, due date/time, assigned-to (either partner or unassigned/both), category, repeat frequency, status (pendiente/hecho/vencido); filters (today/week/all/completed).
- Snooze/reschedule: "Posponer 10 minutos", "Posponer 1 hora", "Mañana", "Reprogramar", "Marcar como hecho" — snoozing safely updates/recreates the relevant `scheduled_notifications` row rather than leaving a stale one.
- Drives push notifications via the `recordatorios` category (see Notifications module). Creating/editing a reminder with a due date writes a `scheduled_notifications` row; completing or deleting the reminder cancels it.

### 7. Chores and household tasks
- Title, description, assigned-to, frequency, next due date, status; mark done (recurring chores roll forward to next due date); filter by assignee/status; overdue indicator.
- Snooze/reschedule support, same as reminders. Drives push notifications via the `tareas` category.

### 8. Calendar
- Route `/calendario`, nav label "Calendario". Monthly view, weekly view, and an "Próximos eventos" upcoming list.
- Custom events (`calendar_events`): title, date, time (optional — "Todo el día" for all-day events), repeat frequency (ninguna/diaria/semanal/mensual/anual), reminder lead time ("Avisarme antes"), optional "Evento privado" flag (visible only to its creator — the one deliberate exception to the fully-shared data model), notes.
- The calendar also surfaces (read-only, not editable from the calendar itself) dated items from other modules: reminders, chores (by next due date), fixed payment due dates (via `payment_instances`), subscription renewal dates, document expiry dates, and planned meals.
- Recurring custom events are expanded on read for display (no separate occurrence table) for daily/weekly/monthly/yearly patterns over a reasonable horizon (e.g. the visible month/week plus the upcoming list).
- Calendar events with a reminder lead time integrate with push notifications via the `calendario` category.

### 9. Notifications
- Web Push is a core v1 feature. Architecture: browser service worker → permission prompt → push subscription stored in `push_subscriptions` → Supabase Edge Function (triggered by Supabase Cron) scans `scheduled_notifications` for due rows and sends pushes → delivery outcome logged in `notification_delivery_attempts` → a `notification_events` row is always created for the in-app notification centre, independent of whether the push itself succeeded.
- Categories: `recordatorios`, `calendario`, `tareas`, `pagos`, `suscripciones`, `documentos`, `menu`, `compra`, `actividad_hogar`, `resumen_diario`, `resumen_semanal`.
- Settings at `/ajustes/notificaciones`: master enable/disable per device ("Permitir notificaciones en este dispositivo"), connected-devices list ("Dispositivos conectados"), test notification button ("Probar notificación"), per-category toggles, lead time ("Avisarme antes"), quiet hours ("Horario sin notificaciones"), "Solo lo asignado a mí" filter, device deactivation ("Desactivar este dispositivo").
- In-app notification centre: chronological list of `notification_events` for the current user, unread/read state, "Marcar como leído" / "Marcar todo como leído" — this is the fallback that always works even if push delivery fails or the platform doesn't support it.
- Privacy: notification bodies never contain exact amounts or sensitive finance detail — see `SECURITY_AND_PRIVACY.md` for the approved phrasing patterns. Sensitive detail is only visible in-app after login.
- Multiple devices per user are supported; each device subscribes/unsubscribes independently.
- Build order (see `BUILD_PLAN.md`): database tables and in-app centre first, then service worker + permission flow + subscription storage + test notification, then the Supabase Edge Function/Cron sender last — live push is the final, not the first, piece.

### 10. Fixed payments
- Recurring household bills: name, amount, category, due day of month, payment method, active/inactive, notes. Feed into dashboard/finance summary of monthly committed spend.
- **Payment history (`payment_instances`):** each month's (or each individual) occurrence is tracked separately from the recurring definition — "Marcar como pagado", "Omitir este mes", "Cambiar importe solo este mes", paid date, paid by, notes. Example: the `fixed_payments` row "Internet, due every 5th" produces a `payment_instances` row "Internet, June 2026, €39.99, pagado".
- Dashboard/finance summary shows: upcoming payments, overdue payments, paid this month, total fixed payments this month, total still pending this month — all computed from `payment_instances`, not just the recurring definition.
- Drives push notifications via the `pagos` category.

### 11. Variable expenses
- Manual one-off expense entries: title, amount, date, category, paid-by, notes. Feed into monthly spend summary.
- May be auto-created (category "Supermercado") from a completed weekly shopping list/trip — see module 3 and `DATA_MODEL.md` for the no-double-counting rule.

### 12. Savings goals
- Goal name, target amount, current amount, target date, priority, notes; contribution history (amount, date, contributor); progress bar.

### 13. Subscriptions
- Name, amount, billing cycle (mensual/trimestral/anual), renewal date, category, active/inactive; renewal-soon highlighting; included in monthly committed spend.
- Drives push notifications via the `suscripciones` category.

### 14. Household documents
- Metadata tracker only in MVP (no required file upload): title, type, provider, expiry date, renewal date, optional URL, notes; upcoming-expiry highlighting.
- Drives push notifications via the `documentos` category.

### 15. Wishlist / future purchases
- Name, estimated cost, priority, target month, optional URL, status (idea/aprobado/comprado/descartado), notes.

### 16. Settings
- Household name (owner can edit), member list, generate/view invite code, own profile display name, locale/currency display (read-only, fixed to es-ES/EUR for MVP), sign out.
- Sub-pages: `/ajustes/notificaciones` (module 9), `/ajustes/dispositivos` (module 1), `/ajustes/categorias` (module 18), `/ajustes/privacidad` (module 19, data export).

### 17. Activity log / audit trail
- Append-only feed of key actions (item added/completed, reminder created, payment added, goal updated, etc.) shown as "recent activity" on the dashboard, in Spanish, attributed to the acting partner.
- For finance, payments, savings goals, documents, reminders, chores, calendar events, shopping lists/spend, and notification settings specifically, track who created/edited/completed/deleted a record and when ("Historial", "Actividad", "Cambios recientes", "Creado por", "Actualizado por") — this reuses `activity_log` plus `created_by`/`updated_at` columns already on those tables; no separate audit table is needed for v1.

### 18. Category management
- Route `/ajustes/categorias`. Create, rename, recolour, and archive categories per module ("Categorías", "Nueva categoría", "Editar categoría", "Archivar categoría", "Color", "Icono").
- Categories already in use are never hard-deleted (archive only) — every `category_id` foreign key is `on delete set null`, so even a hard-deleted category (not exposed in the UI, but possible via direct DB access) degrades safely instead of breaking referencing rows.

### 19. Backup and export
- Route `/ajustes/privacidad`. Export all household data as JSON ("Exportar datos", "Descargar copia de seguridad"); export finance, shopping spend history, and document list as CSV ("Exportar finanzas", "Exportar historial de compra", "Exportar lista de documentos", "Descargar CSV", "Descargar JSON").

### 20. Soft delete and archiving
- Finance records, fixed payments, savings goals, documents, calendar events, reminders, and shopping lists/spend history use soft delete (`deleted_at`/`deleted_by`) and, where archiving makes sense as a distinct lifecycle step (shopping lists, documents), `archived_at`/`archived_by` too. UI: "Archivar", "Restaurar", "Eliminar", "Papelera", "Elemento archivado".
- Other modules (shopping items, chores, recipes, wishlist) keep simple hard delete with a confirmation dialog — they're high-churn, low-stakes records where a trash/restore flow would add friction without much benefit.

### 21. App install guidance
- A dedicated screen/modal ("Instalar la app") with per-platform instructions (iPhone, Android, Mac, Windows) for adding to the home screen, and an explanation that push notifications need: notification permission, a supported browser/device, the app installed where the platform requires it (notably iOS), and notifications enabled at the OS level. Includes "Probar notificación" so the user can confirm it actually works after installing.

## Priority clarification

**v1 priorities** (in build order — see `BUILD_PLAN.md`): Spanish (Spain) UI, authentication (including password reset), two-person household, dashboard, shopping list, weekly menu/recipes — *all already built* — then reminders and chores, calendar module, notification database tables + in-app centre + service worker + device subscriptions + test notification (live scheduled push last), fixed payments with payment instances, weekly shopping spend tracking, savings goals, finance summary, documents, wishlist, settings (including category management, device/session management, data export), security/RLS verification throughout, mobile PWA, and app install guidance.

**Explicitly post-MVP** (see "Post-MVP scope" above): real bank connections, bank CSV import, receipt scanning, item-level shopping price tracking, full offline sync for every module, global search, AI meal suggestions, advanced charts, native iOS/Android apps.

## Definition of done

Every module must satisfy the checklist in `CLAUDE.md` ("Definition of done") before it's considered complete — not just code-complete, but verified against the live Supabase project with RLS checked, Spanish UI confirmed, and all states (empty/loading/error) present.

## Mobile-first UX requirements

- Bottom navigation bar on mobile with the 10 main sections (Inicio, Compra, Menú, Recordatorios, Tareas, Calendario, Finanzas, Documentos, Deseos, Ajustes — grouped as primary + "Más" overflow, see `DESIGN_SYSTEM.md`); sidebar nav on wide/desktop viewports.
- All primary actions ("Añadir producto", "Añadir recordatorio", etc.) reachable with the thumb without scrolling, ideally via a prominent floating/sticky add button on list screens.
- Forms open as full-screen mobile sheets/pages, not cramped modals, on small viewports.
- Lists use card-based rows with clear tap targets, not dense spreadsheet-like tables, on mobile.
- Every list view has a friendly, specific empty state (see `DESIGN_SYSTEM.md`) rather than a blank screen.

## Finance scope guardrails (explicit)

- Manual entry only for all finance data — no bank connections, no Open Banking, no automatic transaction import or categorisation. This still applies with `payment_instances` and shopping spend tracking: both are manual-entry features, not automated reconciliation.
- No financial, tax, or legal advice anywhere in the product (copy, tooltips, or computed "recommendations").
- Any computed figure (e.g. "disponible estimado", weekly/monthly grocery averages) is a simple, transparent arithmetic estimate from data the user entered — never presented as professional advice.
- Push notification bodies never include exact amounts, balances, or other sensitive finance detail — see `SECURITY_AND_PRIVACY.md`.
