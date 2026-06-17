-- Home Hub: mortgage tracking
-- Supports a single household mortgage with payment history.

create table public.mortgages (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null default 'Hipoteca',
  lender text,
  original_principal numeric(14, 2) not null,
  current_balance numeric(14, 2) not null,
  monthly_payment numeric(12, 2) not null,
  interest_rate numeric(6, 4),
  start_date date,
  end_date date,
  payment_day smallint check (payment_day between 1 and 31),
  currency text not null default 'EUR',
  status text not null check (status in ('activa', 'pagada', 'cancelada')) default 'activa',
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  archived_by uuid references auth.users(id),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id)
);

create index mortgages_household_idx on public.mortgages (household_id);

create trigger set_updated_at before update on public.mortgages
  for each row execute function public.set_updated_at();

alter table public.mortgages enable row level security;

create policy "mortgages_select" on public.mortgages
  for select using (public.is_household_member(household_id));
create policy "mortgages_insert" on public.mortgages
  for insert with check (public.is_household_member(household_id));
create policy "mortgages_update" on public.mortgages
  for update using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "mortgages_delete" on public.mortgages
  for delete using (public.is_household_member(household_id));

-- ─── mortgage payments ───────────────────────────────────────────────────────

create table public.mortgage_payments (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  mortgage_id uuid not null references public.mortgages(id) on delete cascade,
  due_date date not null,
  paid_date date,
  amount numeric(12, 2) not null,
  principal_amount numeric(12, 2),
  interest_amount numeric(12, 2),
  extra_payment numeric(12, 2) default 0,
  status text not null check (status in ('pendiente', 'pagado', 'omitido')) default 'pendiente',
  paid_by uuid references auth.users(id),
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index mortgage_payments_household_idx on public.mortgage_payments (household_id);
create index mortgage_payments_mortgage_idx on public.mortgage_payments (mortgage_id);
create index mortgage_payments_due_date_idx on public.mortgage_payments (household_id, due_date desc);

create trigger set_updated_at before update on public.mortgage_payments
  for each row execute function public.set_updated_at();

alter table public.mortgage_payments enable row level security;

create policy "mortgage_payments_select" on public.mortgage_payments
  for select using (public.is_household_member(household_id));
create policy "mortgage_payments_insert" on public.mortgage_payments
  for insert with check (public.is_household_member(household_id));
create policy "mortgage_payments_update" on public.mortgage_payments
  for update using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "mortgage_payments_delete" on public.mortgage_payments
  for delete using (public.is_household_member(household_id));
