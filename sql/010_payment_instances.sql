-- Home Hub: payment history
-- See DATA_MODEL.md "payment_instances".

create table public.payment_instances (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  fixed_payment_id uuid references public.fixed_payments(id) on delete cascade,
  due_date date not null,
  amount numeric(12, 2) not null,
  currency text default 'EUR',
  status text check (status in ('pendiente', 'pagado', 'vencido', 'omitido')) default 'pendiente',
  paid_date date,
  paid_by uuid references auth.users(id),
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index payment_instances_household_due_idx on public.payment_instances (household_id, due_date);
create index payment_instances_fixed_payment_idx on public.payment_instances (fixed_payment_id);
create index payment_instances_household_status_idx on public.payment_instances (household_id, status);

create trigger set_updated_at before update on public.payment_instances
  for each row execute function public.set_updated_at();

alter table public.payment_instances enable row level security;

create policy "payment_instances_select" on public.payment_instances
  for select using (public.is_household_member(household_id));
create policy "payment_instances_insert" on public.payment_instances
  for insert with check (public.is_household_member(household_id));
create policy "payment_instances_update" on public.payment_instances
  for update using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "payment_instances_delete" on public.payment_instances
  for delete using (public.is_household_member(household_id));
