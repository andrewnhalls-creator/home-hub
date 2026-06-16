# DATA_MODEL.md — Home Hub (Supabase / PostgreSQL)

This document is the source of truth for the database schema. The actual SQL lives in `sql/001_initial_schema.sql`, `sql/002_rls_policies.sql`, and `sql/003_seed_categories.sql`, and must match this document. If they diverge, fix the SQL (or update this doc immediately, in the same commit).

## Conventions

- Primary keys: `uuid`, `default gen_random_uuid()` (except `profiles.id`, which mirrors `auth.users.id`).
- All household-scoped tables have `household_id uuid references households(id) on delete cascade`.
- All mutable tables have `created_at timestamptz default now()` and, where the row is editable after creation, `updated_at timestamptz default now()` maintained by a trigger.
- Money fields: `numeric(12,2)`, with a parallel `currency text default 'EUR'` column even though only EUR is used in MVP, to avoid a future migration.
- Status/enum-like fields use `text` + a `check` constraint with Spanish values (since these values may surface directly in UI in some places, and to keep the DB self-documenting).

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
| `notes` | `text` | |
| `created_by` | `uuid references auth.users(id)` | |
| `created_at` | `timestamptz default now()` | |

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

## Relationships overview

- `households` 1—N `household_members`, `household_invites`, `categories`, and every household-scoped table above.
- `households` 1—N `recipes` 1—N `recipe_ingredients`.
- `recipes` 1—N `meal_plans` (optional link; `meal_plans` can stand alone with `custom_name`).
- `savings_goals` 1—N `savings_contributions`.
- `categories` is referenced by `shopping_items`, `recipe_ingredients`, `fixed_payments`, `expenses`, `subscriptions`, `reminders`, `wishlist_items` is intentionally category-less in MVP (priority-driven instead), and `household_documents` uses `document_type` (free text) instead of `category_id` since its types don't overlap with the shared category set.
- Every `category_id` foreign key is `on delete set null`, not the default `no action` — deleting a category (or a household, which cascades to its categories) must not be blocked by, or destroy, rows that merely reference it.

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

## Triggers and functions

- `set_updated_at()` trigger function: sets `updated_at = now()` on update. Attached as a `before update` trigger to every table with an `updated_at` column (`profiles`, `households`, `shopping_items`, `recipes`, `meal_plans`, `reminders`, `chores`, `fixed_payments`, `savings_goals`, `subscriptions`, `household_documents`, `wishlist_items`).
- `is_household_member(household_id uuid)` and `is_household_owner(household_id uuid)` — RLS helper functions, `security definer`, `stable`.
- `redeem_household_invite(invite_code text)` — `security definer` RPC: validates the code (exists, not expired, not used), inserts the calling user into `household_members` as `'member'`, marks the invite used, returns the `household_id`. Used by the join-household onboarding flow so unauthenticated/non-member users never need direct `select` access to `household_invites`.
- `handle_new_user()` — optional trigger on `auth.users` insert to pre-create a `profiles` row; otherwise the app creates the profile row on first login if missing.

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

## Default category seed data (Spanish)

Seeded per household on creation (or globally as `is_default = true` rows the UI also offers when a household has none yet — implementation detail decided in `sql/003_seed_categories.sql`; simplest MVP approach is to seed them for each newly created household via the same function/trigger that creates the household).

**Shopping (`module = 'shopping'`):** Fruta y verdura, Carne y pescado, Lácteos, Panadería, Congelados, Despensa, Limpieza, Baño, Mascotas, Otros.

**Finance (`module = 'finance'`):** Hipoteca / alquiler, Luz, Agua, Internet, Teléfono, Seguros, Coche, Supermercado, Ocio, Salud, Suscripciones, Ahorro, Otros.

**Reminders (`module = 'reminders'`):** Casa, Banco, Salud, Familia, Coche, Documentos, Compras, Otros.

**Chores (`module = 'chores'`):** Limpieza, Cocina, Ropa, Mantenimiento, Plantas, Basura, Otros.

## Explicitly out of scope for the schema (MVP)

- No `transactions`/bank-sync tables of any kind.
- No multi-currency support beyond the `currency` column existing for future-proofing (always `'EUR'` for now).
- No file storage table — `household_documents.storage_url` is a plain text URL field, not a Supabase Storage integration, in MVP.
