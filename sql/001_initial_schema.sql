-- Home Hub: initial schema
-- Tables, indexes, updated_at trigger, and household/invite helper functions.
-- See DATA_MODEL.md for the full design rationale.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_language text default 'es-ES',
  avatar_color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- households
-- ---------------------------------------------------------------------------
create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  locale text default 'es-ES',
  currency text default 'EUR',
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  display_name text,
  created_at timestamptz default now(),
  unique (household_id, user_id)
);

create table public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  code text not null unique,
  created_by uuid references auth.users(id),
  expires_at timestamptz not null,
  used_by uuid references auth.users(id),
  used_at timestamptz,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  module text not null check (
    module in ('shopping', 'finance', 'reminders', 'chores', 'documents', 'wishlist', 'meals')
  ),
  name text not null,
  color text,
  icon text,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- shopping_items
-- ---------------------------------------------------------------------------
create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  quantity numeric,
  unit text,
  category_id uuid references public.categories(id),
  store text,
  priority text check (priority in ('baja', 'normal', 'alta')) default 'normal',
  notes text,
  is_completed boolean default false,
  completed_at timestamptz,
  completed_by uuid references auth.users(id),
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- recipes / recipe_ingredients / meal_plans
-- ---------------------------------------------------------------------------
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  description text,
  prep_time_minutes int,
  difficulty text check (difficulty in ('fácil', 'media', 'difícil')),
  servings int,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  name text not null,
  quantity numeric,
  unit text,
  category_id uuid references public.categories(id),
  created_at timestamptz default now()
);

create table public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  planned_date date not null,
  meal_type text check (meal_type in ('desayuno', 'comida', 'cena', 'snack')),
  recipe_id uuid references public.recipes(id),
  custom_name text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- reminders / chores
-- ---------------------------------------------------------------------------
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  description text,
  due_at timestamptz,
  assigned_to uuid references auth.users(id),
  category_id uuid references public.categories(id),
  repeat_frequency text check (
    repeat_frequency in ('ninguna', 'diaria', 'semanal', 'mensual', 'anual')
  ) default 'ninguna',
  status text check (status in ('pendiente', 'hecho', 'vencido')) default 'pendiente',
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.chores (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid references auth.users(id),
  frequency text check (
    frequency in ('puntual', 'diaria', 'semanal', 'quincenal', 'mensual')
  ),
  next_due_date date,
  status text check (status in ('pendiente', 'hecho', 'vencido')) default 'pendiente',
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- finance: fixed_payments / expenses / savings_goals / savings_contributions / subscriptions
-- ---------------------------------------------------------------------------
create table public.fixed_payments (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null,
  currency text default 'EUR',
  category_id uuid references public.categories(id),
  due_day int check (due_day between 1 and 31),
  payment_method text,
  is_active boolean default true,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  amount numeric(12, 2) not null,
  currency text default 'EUR',
  expense_date date not null,
  category_id uuid references public.categories(id),
  paid_by uuid references auth.users(id),
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  target_amount numeric(12, 2) not null,
  current_amount numeric(12, 2) default 0,
  currency text default 'EUR',
  target_date date,
  priority text check (priority in ('baja', 'normal', 'alta')) default 'normal',
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.savings_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.savings_goals(id) on delete cascade,
  amount numeric(12, 2) not null,
  contribution_date date default current_date,
  contributed_by uuid references auth.users(id),
  notes text,
  created_at timestamptz default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null,
  currency text default 'EUR',
  billing_cycle text check (billing_cycle in ('mensual', 'trimestral', 'anual')) default 'mensual',
  renewal_date date,
  category_id uuid references public.categories(id),
  is_active boolean default true,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- household_documents / wishlist_items / activity_log
-- ---------------------------------------------------------------------------
create table public.household_documents (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  document_type text,
  provider text,
  expiry_date date,
  renewal_date date,
  storage_url text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  estimated_cost numeric(12, 2),
  currency text default 'EUR',
  priority text check (priority in ('baja', 'normal', 'alta')) default 'normal',
  target_month date,
  url text,
  status text check (status in ('idea', 'aprobado', 'comprado', 'descartado')) default 'idea',
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  actor_id uuid references auth.users(id),
  entity_type text,
  entity_id uuid,
  action text,
  summary text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- indexes
-- ---------------------------------------------------------------------------
create index household_members_household_id_idx on public.household_members (household_id);
create index household_members_user_id_idx on public.household_members (user_id);
create index categories_household_module_idx on public.categories (household_id, module);
create index shopping_items_household_completed_idx on public.shopping_items (household_id, is_completed);
create index shopping_items_created_at_idx on public.shopping_items (created_at);
create index recipe_ingredients_recipe_id_idx on public.recipe_ingredients (recipe_id);
create index meal_plans_household_date_idx on public.meal_plans (household_id, planned_date);
create index reminders_household_due_idx on public.reminders (household_id, due_at);
create index reminders_household_status_idx on public.reminders (household_id, status);
create index chores_household_due_idx on public.chores (household_id, next_due_date);
create index chores_household_status_idx on public.chores (household_id, status);
create index fixed_payments_household_active_idx on public.fixed_payments (household_id, is_active);
create index expenses_household_date_idx on public.expenses (household_id, expense_date);
create index savings_goals_household_target_idx on public.savings_goals (household_id, target_date);
create index savings_contributions_goal_id_idx on public.savings_contributions (goal_id);
create index subscriptions_household_renewal_idx on public.subscriptions (household_id, renewal_date);
create index household_documents_household_expiry_idx on public.household_documents (household_id, expiry_date);
create index wishlist_items_household_status_idx on public.wishlist_items (household_id, status);
create index activity_log_household_created_idx on public.activity_log (household_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.households
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.shopping_items
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.recipes
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.meal_plans
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.reminders
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.chores
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.fixed_payments
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.savings_goals
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.household_documents
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.wishlist_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- membership helper functions (used by RLS policies in 002_rls_policies.sql)
-- ---------------------------------------------------------------------------
create function public.is_household_member(p_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.household_members
    where household_id = p_household_id and user_id = auth.uid()
  );
$$;

create function public.is_household_owner(p_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.household_members
    where household_id = p_household_id and user_id = auth.uid() and role = 'owner'
  );
$$;

-- ---------------------------------------------------------------------------
-- new user -> profile row
-- ---------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- default category seeding (invoked by the on_household_created trigger
-- defined in 003_seed_categories.sql)
-- ---------------------------------------------------------------------------
create function public.seed_default_categories(p_household_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (household_id, module, name, is_default)
  values
    (p_household_id, 'shopping', 'Fruta y verdura', true),
    (p_household_id, 'shopping', 'Carne y pescado', true),
    (p_household_id, 'shopping', 'Lácteos', true),
    (p_household_id, 'shopping', 'Panadería', true),
    (p_household_id, 'shopping', 'Congelados', true),
    (p_household_id, 'shopping', 'Despensa', true),
    (p_household_id, 'shopping', 'Limpieza', true),
    (p_household_id, 'shopping', 'Baño', true),
    (p_household_id, 'shopping', 'Mascotas', true),
    (p_household_id, 'shopping', 'Otros', true),
    (p_household_id, 'finance', 'Hipoteca / alquiler', true),
    (p_household_id, 'finance', 'Luz', true),
    (p_household_id, 'finance', 'Agua', true),
    (p_household_id, 'finance', 'Internet', true),
    (p_household_id, 'finance', 'Teléfono', true),
    (p_household_id, 'finance', 'Seguros', true),
    (p_household_id, 'finance', 'Coche', true),
    (p_household_id, 'finance', 'Supermercado', true),
    (p_household_id, 'finance', 'Ocio', true),
    (p_household_id, 'finance', 'Salud', true),
    (p_household_id, 'finance', 'Suscripciones', true),
    (p_household_id, 'finance', 'Ahorro', true),
    (p_household_id, 'finance', 'Otros', true),
    (p_household_id, 'reminders', 'Casa', true),
    (p_household_id, 'reminders', 'Banco', true),
    (p_household_id, 'reminders', 'Salud', true),
    (p_household_id, 'reminders', 'Familia', true),
    (p_household_id, 'reminders', 'Coche', true),
    (p_household_id, 'reminders', 'Documentos', true),
    (p_household_id, 'reminders', 'Compras', true),
    (p_household_id, 'reminders', 'Otros', true),
    (p_household_id, 'chores', 'Limpieza', true),
    (p_household_id, 'chores', 'Cocina', true),
    (p_household_id, 'chores', 'Ropa', true),
    (p_household_id, 'chores', 'Mantenimiento', true),
    (p_household_id, 'chores', 'Plantas', true),
    (p_household_id, 'chores', 'Basura', true),
    (p_household_id, 'chores', 'Otros', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- create_household: atomically creates a household and adds the creator
-- as owner (default categories are seeded separately by the
-- on_household_created trigger in 003_seed_categories.sql). Runs as
-- security definer so the creator can be inserted into household_members
-- before any membership exists (avoids a chicken-and-egg RLS problem on
-- a direct insert).
-- ---------------------------------------------------------------------------
create function public.create_household(p_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_household_id uuid;
  v_display_name text;
begin
  insert into public.households (name, created_by)
  values (p_name, auth.uid())
  returning id into v_household_id;

  select display_name into v_display_name from public.profiles where id = auth.uid();

  insert into public.household_members (household_id, user_id, role, display_name)
  values (v_household_id, auth.uid(), 'owner', v_display_name);

  return v_household_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- redeem_household_invite: validates and consumes an invite code, adding
-- the calling user to the household as a member. Security definer so a
-- non-member can look up a code without a public select policy on
-- household_invites (codes are never directly enumerable).
-- ---------------------------------------------------------------------------
create function public.redeem_household_invite(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite record;
  v_display_name text;
begin
  select * into v_invite
  from public.household_invites
  where code = p_code
    and used_by is null
    and expires_at > now();

  if v_invite is null then
    raise exception 'Código de invitación no válido o caducado';
  end if;

  select display_name into v_display_name from public.profiles where id = auth.uid();

  insert into public.household_members (household_id, user_id, role, display_name)
  values (v_invite.household_id, auth.uid(), 'member', v_display_name)
  on conflict (household_id, user_id) do nothing;

  update public.household_invites
  set used_by = auth.uid(), used_at = now()
  where id = v_invite.id;

  return v_invite.household_id;
end;
$$;
