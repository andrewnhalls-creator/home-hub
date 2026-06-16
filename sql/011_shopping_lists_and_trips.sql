-- Home Hub: weekly shopping spend tracking
-- See DATA_MODEL.md "shopping_lists", "shopping_trips", and
-- "No double-counting grocery spend".

create table public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  week_start_date date,
  week_end_date date,
  planned_budget numeric(12, 2),
  actual_total numeric(12, 2),
  currency text default 'EUR',
  main_store text,
  status text check (status in ('borrador', 'activa', 'comprada', 'archivada')) default 'borrador',
  shopping_date date,
  paid_by uuid references auth.users(id),
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  archived_at timestamptz,
  archived_by uuid references auth.users(id),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id)
);

create table public.shopping_trips (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  shopping_list_id uuid not null references public.shopping_lists(id) on delete cascade,
  store text,
  total_amount numeric(12, 2) not null,
  currency text default 'EUR',
  shopping_date date,
  paid_by uuid references auth.users(id),
  receipt_url text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- shopping_items: items optionally belong to a weekly list.
alter table public.shopping_items
  add column shopping_list_id uuid references public.shopping_lists(id) on delete set null;

-- expenses: link to the shopping list it was auto-created from, with a
-- partial unique index so at most one linked expense can ever exist per
-- list (the no-double-counting rule enforced at the database level).
alter table public.expenses
  add column shopping_list_id uuid references public.shopping_lists(id) on delete set null;

create unique index expenses_shopping_list_id_unique
  on public.expenses (shopping_list_id) where shopping_list_id is not null;

create index shopping_lists_household_week_idx on public.shopping_lists (household_id, week_start_date);
create index shopping_lists_household_status_idx on public.shopping_lists (household_id, status);
create index shopping_trips_shopping_list_idx on public.shopping_trips (shopping_list_id);
create index shopping_items_shopping_list_idx on public.shopping_items (shopping_list_id);

create trigger set_updated_at before update on public.shopping_lists
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.shopping_trips
  for each row execute function public.set_updated_at();

alter table public.shopping_lists enable row level security;
alter table public.shopping_trips enable row level security;

create policy "shopping_lists_select" on public.shopping_lists
  for select using (public.is_household_member(household_id));
create policy "shopping_lists_insert" on public.shopping_lists
  for insert with check (public.is_household_member(household_id));
create policy "shopping_lists_update" on public.shopping_lists
  for update using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "shopping_lists_delete" on public.shopping_lists
  for delete using (public.is_household_member(household_id));

create policy "shopping_trips_select" on public.shopping_trips
  for select using (public.is_household_member(household_id));
create policy "shopping_trips_insert" on public.shopping_trips
  for insert with check (public.is_household_member(household_id));
create policy "shopping_trips_update" on public.shopping_trips
  for update using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "shopping_trips_delete" on public.shopping_trips
  for delete using (public.is_household_member(household_id));
