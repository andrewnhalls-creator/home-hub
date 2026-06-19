# DATA_MODEL.md — Home Hub (Supabase / PostgreSQL)

This document is the source of truth for the database schema. The actual SQL lives in `sql/001_initial_schema.sql` through `sql/008_category_fk_set_null.sql` (applied), with further migrations to follow for the tables added below (calendar, notifications, payment history, shopping spend). The live schema and this document must match — if they diverge, fix the SQL (or update this doc immediately, in the same commit).

**2026-06-16 update:** added a calendar module, a core (not optional) Web Push notification system, per-occurrence payment history, and weekly shopping-spend tracking, per an updated requirements pass. New tables: `calendar_events`, `payment_instances`, `shopping_lists`, `shopping_trips`, `notification_preferences`, `push_subscriptions`, `notification_events`, `notification_delivery_attempts`, `scheduled_notifications`. Soft-delete columns (`deleted_at`/`deleted_by`, and `archived_at`/`archived_by` where archiving applies) were added to the tables listed in "Soft delete and archiving" below.

## Conventions

- Primary keys: `uuid`, `default gen_random_uuid()` (except `profiles.id`, which mirrors `auth.users.id`).
- All household-scoped tables have `household_id uuid references households(id) on delete cascade`.
- All mutable tables have `created_at timestamptz default now()` and, where the row is editable after creation, `updated_at timestamptz default now()` maintained by a trigger.
- Money fields: `numeric(12,2)`, with a parallel `currency text default 'EUR'` column even though only EUR is used in MVP, to avoid a future migration.
- Status/enum-like fields use `text` + a `check` constraint with Spanish values (since these values may surface directly in UI in some places, and to keep the DB self-documenting).
- **Soft delete and archiving:** `deleted_at`/`deleted_by` and (where listed) `archived_at`/`archived_by` are plain nullable columns, not enforced by RLS — a soft-deleted row is still selectable by household members at the database level. The app is responsible for filtering `deleted_at is null` (and, on dedicated "Papelera"/trash views, the opposite) in every query against a soft-deletable table. This is a deliberate simplicity trade-off for a 2-person household app; do not add a `deleted_at`-aware RLS policy unless a real need for DB-level enforcement shows up.

## Tables

### `profiles`
Application profile linked 1:1 to a Supabase Auth user.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key references auth.users(id) on delete cascade` | |
| `display_name` | `text` | |
| `preferred_language` | `text default 'es-ES'` | |
| `avatar_color` | `text` | hex or design-token name, used for avatar initials background |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | trigger-maintained |

### `households`
The shared workspace for a couple.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `name` | `text not null` | |
| `locale` | `text default 'es-ES'` | |
| `currency` | `text default 'EUR'` | |
| `created_by` | `uuid references auth.users(id)` | |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | trigger-maintained |

### `household_members`
Join table: which users belong to which household, and their role.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `user_id` | `uuid references auth.users(id) on delete cascade` | |
| `role` | `text check (role in ('owner','member'))` | |
| `display_name` | `text` | denormalised snapshot for fast member lists |
| `created_at` | `timestamptz default now()` | |

Constraint: `unique (household_id, user_id)`.

### `household_invites`
Invite codes used to bring the second person into a household.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `code` | `text unique not null` | short random code, e.g. 8 chars |
| `created_by` | `uuid references auth.users(id)` | |
| `expires_at` | `timestamptz` | invites should always have an expiry |
| `used_by` | `uuid references auth.users(id)` | null until consumed |
| `used_at` | `timestamptz` | |
| `created_at` | `timestamptz default now()` | |

### `categories`
Shared categories, scoped per household and per module, so households can customise/add to the seeded defaults.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `module` | `text not null` | one of `shopping`, `finance`, `reminders`, `chores`, `documents`, `wishlist`, `meals` |
| `name` | `text not null` | |
| `color` | `text` | |
| `icon` | `text` | `lucide-react` icon name |
| `is_default` | `boolean default false` | true for seeded categories |
| `created_at` | `timestamptz default now()` | |

### `shopping_items`
Shared shopping list.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `shopping_list_id` | `uuid references shopping_lists(id) on delete set null` | optional — items can belong to a weekly list or stand alone for quick one-off adds |
| `name` | `text not null` | |
| `quantity` | `numeric` | |
| `unit` | `text` | |
| `category_id` | `uuid references categories(id) on delete set null` | |
| `store` | `text` | |
| `priority` | `text check (priority in ('baja','normal','alta')) default 'normal'` | |
| `notes` | `text` | |
| `is_completed` | `boolean default false` | |
| `completed_at` | `timestamptz` | |
| `completed_by` | `uuid references auth.users(id)` | |
| `created_by` | `uuid references auth.users(id)` | |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | trigger-maintained |

### `recipes`

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `name` | `text not null` | |
| `description` | `text` | |
| `prep_time_minutes` | `int` | |
| `difficulty` | `text check (difficulty in ('fácil','media','difícil'))` | |
| `servings` | `int` | |
| `notes` | `text` | |
| `created_by` | `uuid references auth.users(id)` | |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | trigger-maintained |

### `recipe_ingredients`

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `recipe_id` | `uuid references recipes(id) on delete cascade` | |
| `name` | `text not null` | |
| `quantity` | `numeric` | |
| `unit` | `text` | |
| `category_id` | `uuid references categories(id) on delete set null` | used to pre-fill category when added to shopping list |
| `created_at` | `timestamptz default now()` | |

### `meal_plans`
Weekly menu planner entries.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `planned_date` | `date not null` | |
| `meal_type` | `text check (meal_type in ('desayuno','comida','cena','snack'))` | |
| `recipe_id` | `uuid references recipes(id)` | nullable if custom meal |
| `custom_name` | `text` | used when no recipe is linked |
| `notes` | `text` | |
| `created_by` | `uuid references auth.users(id)` | |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | trigger-maintained |

### `reminders`

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `title` | `text not null` | |
| `description` | `text` | |
| `due_at` | `timestamptz` | |
| `assigned_to` | `uuid references auth.users(id)` | nullable = unassigned/both |
| `category_id` | `uuid references categories(id) on delete set null` | |
| `repeat_frequency` | `text check (repeat_frequency in ('ninguna','diaria','semanal','mensual','anual')) default 'ninguna'` | |
| `status` | `text check (status in ('pendiente','hecho','vencido')) default 'pendiente'` | |
| `created_by` | `uuid references auth.users(id)` | |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | trigger-maintained |
| `deleted_at` | `timestamptz` | soft delete |
| `deleted_by` | `uuid references auth.users(id)` | |

### `chores`

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `title` | `text not null` | |
| `description` | `text` | |
| `assigned_to` | `uuid references auth.users(id)` | |
| `frequency` | `text check (frequency in ('puntual','diaria','semanal','quincenal','mensual'))` | |
| `next_due_date` | `date` | |
| `status` | `text check (status in ('pendiente','hecho','vencido')) default 'pendiente'` | |
| `created_by` | `uuid references auth.users(id)` | |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | trigger-maintained |

### `fixed_payments`

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `name` | `text not null` | |
| `amount` | `numeric(12,2) not null` | |
| `currency` | `text default 'EUR'` | |
| `category_id` | `uuid references categories(id) on delete set null` | |
| `due_day` | `int check (due_day between 1 and 31)` | |
| `payment_method` | `text` | |
| `is_active` | `boolean default true` | |
| `notes` | `text` | |
| `created_by` | `uuid references auth.users(id)` | |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | trigger-maintained |
| `deleted_at` | `timestamptz` | soft delete — see "Soft delete and archiving" |
| `deleted_by` | `uuid references auth.users(id)` | |

### `expenses`

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `title` | `text not null` | |
| `amount` | `numeric(12,2) not null` | |
| `currency` | `text default 'EUR'` | |
| `expense_date` | `date not null` | |
| `category_id` | `uuid references categories(id) on delete set null` | |
| `paid_by` | `uuid references auth.users(id)` | |
| `shopping_list_id` | `uuid references shopping_lists(id) on delete set null` | set when this expense was auto-created from a completed weekly shopping list/trip; see "No double-counting grocery spend" below |
| `notes` | `text` | |
| `created_by` | `uuid references auth.users(id)` | |
| `created_at` | `timestamptz default now()` | |
| `deleted_at` | `timestamptz` | soft delete |
| `deleted_by` | `uuid references auth.users(id)` | |

Constraint: `create unique index expenses_shopping_list_id_unique on expenses (shopping_list_id) where shopping_list_id is not null;` — guarantees at most one expense row per shopping list, enforcing the no-double-counting rule at the database level, not just in application logic.

### `savings_goals`

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `name` | `text not null` | |
| `target_amount` | `numeric(12,2) not null` | |
| `current_amount` | `numeric(12,2) default 0` | derived/cached from contributions, kept in sync by app logic |
| `currency` | `text default 'EUR'` | |
| `target_date` | `date` | |
| `priority` | `text check (priority in ('baja','normal','alta')) default 'normal'` | |
| `notes` | `text` | |
| `created_by` | `uuid references auth.users(id)` | |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | trigger-maintained |
| `deleted_at` | `timestamptz` | soft delete |
| `deleted_by` | `uuid references auth.users(id)` | |

### `savings_contributions`

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `goal_id` | `uuid references savings_goals(id) on delete cascade` | |
| `amount` | `numeric(12,2) not null` | |
| `contribution_date` | `date default current_date` | |
| `contributed_by` | `uuid references auth.users(id)` | |
| `notes` | `text` | |
| `created_at` | `timestamptz default now()` | |

### `subscriptions`

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `name` | `text not null` | |
| `amount` | `numeric(12,2) not null` | |
| `currency` | `text default 'EUR'` | |
| `billing_cycle` | `text check (billing_cycle in ('mensual','trimestral','anual')) default 'mensual'` | |
| `renewal_date` | `date` | |
| `category_id` | `uuid references categories(id) on delete set null` | |
| `is_active` | `boolean default true` | |
| `notes` | `text` | |
| `created_by` | `uuid references auth.users(id)` | |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | trigger-maintained |
| `deleted_at` | `timestamptz` | soft delete |
| `deleted_by` | `uuid references auth.users(id)` | |

### `household_documents`
Metadata only in MVP — no required file upload.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `title` | `text not null` | |
| `document_type` | `text` | |
| `provider` | `text` | |
| `expiry_date` | `date` | |
| `renewal_date` | `date` | |
| `storage_url` | `text` | optional external/Storage URL |
| `notes` | `text` | |
| `created_by` | `uuid references auth.users(id)` | |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | trigger-maintained |
| `archived_at` | `timestamptz` | |
| `archived_by` | `uuid references auth.users(id)` | |
| `deleted_at` | `timestamptz` | soft delete |
| `deleted_by` | `uuid references auth.users(id)` | |

### `wishlist_items`

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `name` | `text not null` | |
| `estimated_cost` | `numeric(12,2)` | |
| `currency` | `text default 'EUR'` | |
| `priority` | `text check (priority in ('baja','normal','alta')) default 'normal'` | |
| `target_month` | `date` | stored as first-of-month date |
| `url` | `text` | |
| `status` | `text check (status in ('idea','aprobado','comprado','descartado')) default 'idea'` | |
| `notes` | `text` | |
| `created_by` | `uuid references auth.users(id)` | |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | trigger-maintained |

### `activity_log`
Append-only feed.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `actor_id` | `uuid references auth.users(id)` | |
| `entity_type` | `text` | e.g. `shopping_item`, `reminder` |
| `entity_id` | `uuid` | |
| `action` | `text` | e.g. `created`, `completed`, `updated`, `deleted` |
| `summary` | `text` | pre-rendered Spanish summary string, e.g. "Añadió un producto a la compra" |
| `created_at` | `timestamptz default now()` | |

### `calendar_events`
Custom calendar entries. Reminders, chores, payment due dates, subscription renewals, document expiry, and meal plans also appear on the calendar but are *not* stored here — the calendar view reads them from their own tables and merges them with `calendar_events` for display.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `title` | `text not null` | |
| `description` | `text` | |
| `event_date` | `date not null` | |
| `event_time` | `time` | null when `is_all_day` |
| `is_all_day` | `boolean default false` | |
| `repeat_frequency` | `text check (repeat_frequency in ('ninguna','diaria','semanal','mensual','anual')) default 'ninguna'` | recurring events are expanded on read, not materialised into rows |
| `remind_before_minutes` | `int` | drives a `scheduled_notifications` row in the `calendario` category |
| `is_private` | `boolean default false` | the one deliberate exception to the shared-data model — visible only to `created_by` when true; see RLS strategy |
| `notes` | `text` | |
| `created_by` | `uuid references auth.users(id)` | |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | trigger-maintained |
| `deleted_at` | `timestamptz` | soft delete |
| `deleted_by` | `uuid references auth.users(id)` | |

### `payment_instances`
One row per actual occurrence of a fixed payment (or an ad-hoc payment not tied to a recurring definition). This is what "paid this month" / "overdue" / "upcoming" are computed from — `fixed_payments` only describes the recurring template.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `fixed_payment_id` | `uuid references fixed_payments(id) on delete cascade` | nullable — null for a one-off payment not generated from a recurring template |
| `due_date` | `date not null` | |
| `amount` | `numeric(12,2) not null` | defaults to the parent `fixed_payments.amount` at creation time but can be overridden for one month ("Cambiar importe solo este mes") without altering the recurring definition |
| `currency` | `text default 'EUR'` | |
| `status` | `text check (status in ('pendiente','pagado','vencido','omitido')) default 'pendiente'` | |
| `paid_date` | `date` | |
| `paid_by` | `uuid references auth.users(id)` | |
| `notes` | `text` | |
| `created_by` | `uuid references auth.users(id)` | |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | trigger-maintained |

### `shopping_lists`
A weekly shopping list/session, used to track grocery spend over time.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `name` | `text not null` | e.g. "Semana del 15/06" |
| `week_start_date` | `date` | |
| `week_end_date` | `date` | |
| `planned_budget` | `numeric(12,2)` | |
| `actual_total` | `numeric(12,2)` | manual entry in v1; can be computed as the sum of `shopping_trips` when trips are used instead |
| `currency` | `text default 'EUR'` | |
| `main_store` | `text` | |
| `status` | `text check (status in ('borrador','activa','comprada','archivada')) default 'borrador'` | |
| `shopping_date` | `date` | |
| `paid_by` | `uuid references auth.users(id)` | |
| `notes` | `text` | |
| `created_by` | `uuid references auth.users(id)` | |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | trigger-maintained |
| `archived_at` | `timestamptz` | |
| `archived_by` | `uuid references auth.users(id)` | |
| `deleted_at` | `timestamptz` | soft delete |
| `deleted_by` | `uuid references auth.users(id)` | |

### `shopping_trips`
One actual store visit belonging to a shopping list — a single weekly shop is often split across more than one store.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `shopping_list_id` | `uuid references shopping_lists(id) on delete cascade` | |
| `store` | `text` | |
| `total_amount` | `numeric(12,2) not null` | |
| `currency` | `text default 'EUR'` | |
| `shopping_date` | `date` | |
| `paid_by` | `uuid references auth.users(id)` | |
| `receipt_url` | `text` | optional, for a future receipt-photo feature; not used in v1 |
| `notes` | `text` | |
| `created_by` | `uuid references auth.users(id)` | |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | trigger-maintained |

### `notification_preferences`
One row per (household, user) — not per category, to keep the table count matched to the spec. Per-category toggles live in the `categories` jsonb column.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `user_id` | `uuid references auth.users(id) on delete cascade` | |
| `push_enabled` | `boolean default true` | master toggle, "Permitir notificaciones en este dispositivo" is the device-level equivalent on `push_subscriptions` |
| `categories` | `jsonb not null default '{"recordatorios":true,"calendario":true,"tareas":true,"pagos":true,"suscripciones":true,"documentos":true,"menu":true,"compra":true,"actividad_hogar":true,"resumen_diario":true,"resumen_semanal":true}'` | one boolean per notification category |
| `lead_time_minutes` | `int default 30` | "Avisarme antes" |
| `quiet_hours_start` | `time` | "Horario sin notificaciones" |
| `quiet_hours_end` | `time` | |
| `only_assigned_to_me` | `boolean default false` | |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | trigger-maintained |

Constraint: `unique (household_id, user_id)`.

### `push_subscriptions`
One row per device/browser a user has enabled push notifications on.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `user_id` | `uuid references auth.users(id) on delete cascade` | |
| `endpoint` | `text not null unique` | the browser push service URL — uniquely identifies a subscription |
| `p256dh` | `text not null` | public key from the browser's `PushSubscription.toJSON().keys` |
| `auth_key` | `text not null` | auth secret from the same (named `auth_key`, not `auth`, to avoid clashing with the `auth` schema) |
| `device_name` | `text` | user-editable label, e.g. "iPhone de Ana" |
| `user_agent` | `text` | |
| `is_active` | `boolean default true` | |
| `last_seen_at` | `timestamptz default now()` | |
| `created_at` | `timestamptz default now()` | |
| `deactivated_at` | `timestamptz` | "Desactivar este dispositivo" |

Neither `p256dh` nor `auth_key` is ever logged or rendered in the UI beyond existence/device metadata — see `SECURITY_AND_PRIVACY.md`.

### `notification_events`
The in-app notification centre feed — always written, regardless of whether the push itself succeeds, so the user never loses a notification just because push delivery failed or the platform doesn't support it.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `user_id` | `uuid references auth.users(id) on delete cascade` | recipient |
| `category` | `text not null` | one of the notification categories |
| `title` | `text not null` | |
| `body` | `text` | privacy-safe text only — see `SECURITY_AND_PRIVACY.md` |
| `entity_type` | `text` | |
| `entity_id` | `uuid` | |
| `is_read` | `boolean default false` | |
| `read_at` | `timestamptz` | |
| `created_at` | `timestamptz default now()` | |

### `notification_delivery_attempts`
Delivery logging for push attempts, written by the Supabase Edge Function (service role), never by the client.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `notification_event_id` | `uuid references notification_events(id) on delete cascade` | |
| `push_subscription_id` | `uuid references push_subscriptions(id) on delete cascade` | |
| `status` | `text check (status in ('pendiente','enviado','fallido')) default 'pendiente'` | |
| `status_code` | `int` | HTTP status returned by the push service |
| `error_message` | `text` | safe to store — never include subscription keys or payload content here |
| `attempted_at` | `timestamptz default now()` | |

### `scheduled_notifications`
The due-notification queue. Created when a reminder/chore/calendar event/payment/subscription/document with a due date is created or edited; processed by the Supabase Cron-triggered Edge Function; cancelled or updated on snooze/reschedule/completion.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | |
| `household_id` | `uuid references households(id) on delete cascade` | |
| `user_id` | `uuid references auth.users(id) on delete cascade` | nullable — null means "the whole household" (fanned out to every member's active subscriptions at send time) |
| `category` | `text not null` | |
| `entity_type` | `text` | |
| `entity_id` | `uuid` | |
| `scheduled_for` | `timestamptz not null` | |
| `title` | `text not null` | |
| `body` | `text` | privacy-safe text only |
| `status` | `text check (status in ('pendiente','procesando','enviado','fallido','cancelado')) default 'pendiente'` | |
| `processed_at` | `timestamptz` | |
| `idempotency_key` | `text not null unique` | e.g. `reminder:{id}:{due_at}` — guarantees the same occurrence is never sent twice even if the processor runs concurrently or retries |
| `created_at` | `timestamptz default now()` | |

## Relationships overview

- `households` 1—N `household_members`, `household_invites`, `categories`, and every household-scoped table above.
- `households` 1—N `recipes` 1—N `recipe_ingredients`.
- `recipes` 1—N `meal_plans` (optional link; `meal_plans` can stand alone with `custom_name`).
- `savings_goals` 1—N `savings_contributions`.
- `fixed_payments` 1—N `payment_instances` (nullable link — a `payment_instances` row can also stand alone for a one-off payment).
- `shopping_lists` 1—N `shopping_items` (optional — items can be ungrouped), 1—N `shopping_trips`, 0—1 `expenses` (see "No double-counting" below).
- `push_subscriptions` 1—N `notification_delivery_attempts`; `notification_events` 1—N `notification_delivery_attempts`.
- `categories` is referenced by `shopping_items`, `recipe_ingredients`, `fixed_payments`, `expenses`, `subscriptions`, `reminders`. `wishlist_items` is intentionally category-less in MVP (priority-driven instead); `household_documents` uses `document_type` (free text) instead of `category_id`; `calendar_events`, `payment_instances`, `shopping_lists`, `shopping_trips`, and all notification tables are likewise category-less (calendar/payment-instance/shopping-list status fields and the fixed notification category enum cover their classification needs).
- Every `category_id` foreign key is `on delete set null`, not the default `no action` — deleting a category (or a household, which cascades to its categories) must not be blocked by, or destroy, rows that merely reference it.

### No double-counting grocery spend

Weekly grocery spend can be recorded two ways — a `shopping_lists.actual_total` (manual) or summed `shopping_trips.total_amount` — and must feed into the finance summary as exactly **one** `expenses` row in the "Supermercado" category, never both a shopping-spend figure and a separate manually-entered expense for the same shop. The rule:

1. When a `shopping_lists` row transitions to `status = 'comprada'` with a non-null total (manual `actual_total`, or the sum of its `shopping_trips`), the app creates a single `expenses` row with `shopping_list_id` set to that list.
2. The `expenses_shopping_list_id_unique` partial unique index makes a second linked expense for the same list impossible at the database level, not just by convention.
3. Editing the list's total after the fact updates the linked expense's `amount`; it never inserts a second one.
4. A manually-entered "Supermercado" expense with `shopping_list_id = null` is unrelated to any list and is never auto-linked.

### Calendar event privacy exception

`calendar_events.is_private` is the one deliberate exception to "no private-vs-shared data within a household." When true, the row is visible only to `created_by` — see the RLS policy below. Every other table in the schema remains fully shared between household members.

## RLS strategy

- RLS is **enabled on every table** listed above, including `profiles`, `households`, `household_members`, and `household_invites`.
- Helper function `is_household_member(household_id uuid) returns boolean`, `security definer`, checks `exists (select 1 from household_members where household_id = $1 and user_id = auth.uid())`. All policies on household-scoped tables call this helper rather than re-deriving membership inline.
- Helper function `is_household_owner(household_id uuid) returns boolean` similarly checks `role = 'owner'`, used for member/invite management policies.
- General pattern per household-scoped table:
  - `select`: `is_household_member(household_id)`
  - `insert`: `with check (is_household_member(household_id))`
  - `update`: `using (is_household_member(household_id)) with check (is_household_member(household_id))`
  - `delete`: `using (is_household_member(household_id))`
- `households`: `select`/`update` restricted to members (`is_household_member(id)`); `insert` allowed for any authenticated user (creating a new household); no `delete` policy in MVP (handled manually/manually via support if ever needed).
- `household_members`: members can `select` rows in their own household; only owners can `insert`/`update`/`delete` other members' rows (a user joining via invite is inserted via a `security definer` function tied to invite redemption, not a direct insert policy open to all).
- `household_invites`: only owners can `select`/`insert`/`update`/`delete` invites for their household. Invite **redemption** (looking up a code to join) happens through a `security definer` RPC function (`redeem_household_invite(code text)`) rather than a public `select` policy on the table, so codes aren't enumerable.
- `profiles`: a user can always `select`/`update` their own profile (`id = auth.uid()`); a user can `select` profiles of other members of any household they belong to (join through `household_members`), so partner display names/avatars can render.
- No table has a public/anonymous-readable policy. No table allows cross-household access.
- Tables with a `recipe_ingredients`-style indirect household link (no `household_id` column directly) are scoped via a subquery to the parent's `household_id` (e.g. `recipe_ingredients` policy checks `is_household_member((select household_id from recipes where id = recipe_id))`).
- `calendar_events`: `select` is `is_household_member(household_id) and (not is_private or created_by = auth.uid())` — the private-event exception. `update`/`delete` use the same predicate (a private event can only be modified by its creator); `insert` is the standard `is_household_member(household_id)` check.
- `notification_preferences`, `push_subscriptions`: every policy additionally requires `user_id = auth.uid()` on top of `is_household_member(household_id)` — a user can only ever see or manage their own preferences/devices, never their partner's, even though they share a household. This is the one place household-membership alone is **not** sufficient.
- `notification_events`: `select`/`update` (for marking read) require `user_id = auth.uid()` — a user's notification feed is their own, not shared, since "solo lo asignado a mí" and per-user read state wouldn't make sense shared. `insert` only requires `is_household_member(household_id)` so any member's action can notify the other.
- `notification_delivery_attempts`: `select` only, scoped via a join to `notification_events.user_id = auth.uid()`. No `insert`/`update`/`delete` policy for `anon`/`authenticated` — only the Supabase Edge Function (service role, which bypasses RLS) writes these rows.
- `scheduled_notifications`: `select`/`insert`/`update`/`delete` use `is_household_member(household_id)` (household members can see and manage their household's scheduled notifications, including their own personal ones where `user_id = auth.uid()` or `user_id is null`); the Edge Function processes rows as the service role regardless.
- `payment_instances`, `shopping_lists`, `shopping_trips`: standard household-scoped CRUD pattern, no exceptions.

## Triggers and functions

- `set_updated_at()` trigger function: sets `updated_at = now()` on update. Attached as a `before update` trigger to every table with an `updated_at` column (`profiles`, `households`, `shopping_items`, `recipes`, `meal_plans`, `reminders`, `chores`, `fixed_payments`, `savings_goals`, `subscriptions`, `household_documents`, `wishlist_items`, `calendar_events`, `payment_instances`, `shopping_lists`, `shopping_trips`, `notification_preferences`).
- `is_household_member(household_id uuid)` and `is_household_owner(household_id uuid)` — RLS helper functions, `security definer`, `stable`.
- `redeem_household_invite(invite_code text)` — `security definer` RPC: validates the code (exists, not expired, not used), inserts the calling user into `household_members` as `'member'`, marks the invite used, returns the `household_id`. Used by the join-household onboarding flow so unauthenticated/non-member users never need direct `select` access to `household_invites`.
- `handle_new_user()` — optional trigger on `auth.users` insert to pre-create a `profiles` row; otherwise the app creates the profile row on first login if missing.
- `generate_due_notifications()` — `security definer`, invoked by Supabase Cron (not Vercel cron) on a short interval (e.g. every 5 minutes): scans reminders/chores/calendar events/payment instances/subscriptions/documents for upcoming due dates within their configured lead time, upserts a `scheduled_notifications` row per (entity, occurrence) using a deterministic `idempotency_key` so re-running it never double-schedules.
- The actual push **send** is a Supabase Edge Function (not a plain Postgres function, since it needs to make outbound HTTPS calls to push services), triggered by the same Supabase Cron schedule: it claims due `scheduled_notifications` rows (`status = 'pendiente' and scheduled_for <= now()`), looks up the recipient's active `push_subscriptions` and `notification_preferences` (respecting category toggles, quiet hours, and "solo lo asignado a mí"), sends the Web Push request using the VAPID keys (private key read from an Edge Function secret, never from client code), writes one `notification_delivery_attempts` row per subscription attempted, writes one `notification_events` row regardless of push success so the in-app centre is always populated, and marks the `scheduled_notifications` row `enviado`/`fallido`.

## Indexes

In addition to primary keys and the `household_invites.code` unique index:

- `household_members (household_id)`, `household_members (user_id)`
- `categories (household_id, module)`
- `shopping_items (household_id, is_completed)`, `shopping_items (created_at)`
- `recipe_ingredients (recipe_id)`
- `meal_plans (household_id, planned_date)`
- `reminders (household_id, due_at)`, `reminders (household_id, status)`
- `chores (household_id, next_due_date)`, `chores (household_id, status)`
- `fixed_payments (household_id, is_active)`
- `expenses (household_id, expense_date)`
- `savings_goals (household_id, target_date)`
- `savings_contributions (goal_id)`
- `subscriptions (household_id, renewal_date)`
- `household_documents (household_id, expiry_date)`
- `wishlist_items (household_id, status)`
- `activity_log (household_id, created_at desc)`
- `calendar_events (household_id, event_date)`
- `payment_instances (household_id, due_date)`, `payment_instances (fixed_payment_id)`, `payment_instances (household_id, status)`
- `shopping_lists (household_id, week_start_date)`, `shopping_lists (household_id, status)`
- `shopping_trips (shopping_list_id)`
- `shopping_items (shopping_list_id)`
- `notification_events (user_id, is_read)`, `notification_events (household_id, created_at desc)`
- `push_subscriptions (user_id)`, `push_subscriptions (household_id)`
- `scheduled_notifications (status, scheduled_for)` — the primary index the Edge Function's claim query uses
- `notification_delivery_attempts (notification_event_id)`

## Default category seed data (Spanish)

Seeded per household on creation (or globally as `is_default = true` rows the UI also offers when a household has none yet — implementation detail decided in `sql/003_seed_categories.sql`; simplest MVP approach is to seed them for each newly created household via the same function/trigger that creates the household).

**Shopping (`module = 'shopping'`):** Fruta y verdura, Carne y pescado, Lácteos, Panadería, Congelados, Despensa, Limpieza, Baño, Mascotas, Otros.

**Finance (`module = 'finance'`):** Hipoteca / alquiler, Luz, Agua, Internet, Teléfono, Seguros, Coche, Supermercado, Ocio, Salud, Suscripciones, Ahorro, Otros.

**Reminders (`module = 'reminders'`):** Casa, Banco, Salud, Familia, Coche, Documentos, Compras, Otros.

**Chores (`module = 'chores'`):** Limpieza, Cocina, Ropa, Mantenimiento, Plantas, Basura, Otros.

## Migrations 030–031 (2026-06-19)

### `bank_account` column (migration 030)
Added `bank_account text check (bank_account in ('ING', 'BBVA', 'Revolut'))` nullable column to:
- `income_sources`
- `fixed_payments`
- `expenses`
- `subscriptions`
- `savings_contributions`

Allows users to tag each finance record with the bank account it relates to, for reconciliation purposes.

### `debts`

Tracks household debts (loans, credit cards, etc.) with optional amortisation fields.

| column | type | notes |
|---|---|---|
| `id` | `uuid primary key` | |
| `household_id` | `uuid references households(id) on delete cascade` | RLS-scoped |
| `name` | `text not null` | e.g. "Préstamo coche" |
| `balance` | `numeric(12,2) not null default 0` | current outstanding balance |
| `monthly_payment` | `numeric(12,2)` | monthly instalment amount |
| `payment_day` | `integer check (payment_day between 1 and 31)` | day of month payment is due |
| `interest_rate` | `numeric(6,4)` | annual interest rate (%) |
| `lender` | `text` | name of lender/institution |
| `start_date` | `date` | when the debt started |
| `notes` | `text` | freeform notes |
| `currency` | `text default 'EUR'` | |
| `created_by` | `uuid references auth.users(id)` | |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | trigger-maintained |
| `deleted_at` | `timestamptz` | soft delete |
| `deleted_by` | `uuid references auth.users(id)` | |

RLS: select/insert/update/delete restricted to household members via `is_household_member(household_id)`.

## Explicitly out of scope for the schema (MVP)

- No `transactions`/bank-sync tables of any kind.
- No multi-currency support beyond the `currency` column existing for future-proofing (always `'EUR'` for now).
- No file storage table — `household_documents.storage_url` is a plain text URL field, not a Supabase Storage integration, in MVP.
- No `calendar_event_occurrences` materialised-occurrence table — recurring calendar events are expanded on read for the visible date range. `payment_instances` is the only recurrence pattern materialised into real rows, because payment history specifically needs persisted paid/skipped/amount-override state per occurrence, not just a computed future date.
- No separate audit-log table beyond the existing `activity_log` plus each table's own `created_by`/`updated_at` (and now `deleted_by`/`archived_by`) columns — sufficient for a 2-person household's "who changed what" needs without a generic event-sourcing system.
- No `notification_categories` lookup table — the category enum is fixed (11 values, listed on `notification_preferences`/`notification_events`/`scheduled_notifications`) and small enough to hardcode as a `check` constraint rather than make configurable.
- Item-level shopping prices are out of scope for v1 — `shopping_items` has no price column; spend is tracked at the list/trip level only (`shopping_lists.actual_total` / `shopping_trips.total_amount`).
