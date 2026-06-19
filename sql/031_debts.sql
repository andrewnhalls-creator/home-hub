-- Home Hub: debts table
-- Tracks loans, credit cards, and other liabilities.
-- UI page is built in Stage 3; this migration provides the schema.

create table public.debts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  balance numeric(12, 2) not null,
  monthly_payment numeric(12, 2),
  payment_day int check (payment_day between 1 and 31),
  interest_rate numeric(5, 4),
  lender text,
  start_date date,
  notes text,
  currency text default 'EUR',
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id)
);

create index debts_household_idx on public.debts (household_id);

create trigger set_updated_at before update on public.debts
  for each row execute function public.set_updated_at();

alter table public.debts enable row level security;

create policy "debts_select" on public.debts
  for select using (public.is_household_member(household_id));
create policy "debts_insert" on public.debts
  for insert with check (public.is_household_member(household_id));
create policy "debts_update" on public.debts
  for update using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));
create policy "debts_delete" on public.debts
  for delete using (public.is_household_member(household_id));
