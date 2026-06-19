-- Home Hub: income sources
-- Tracks fixed income entries per household (salary, pension, extra income, etc.)

create table public.income_sources (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null,
  frequency text not null check (frequency in ('mensual', 'trimestral', 'anual')) default 'mensual',
  earner_name text,
  is_active boolean default true,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id)
);

create index income_sources_household_active_idx on public.income_sources (household_id, is_active);

create trigger set_updated_at before update on public.income_sources
  for each row execute function public.set_updated_at();

alter table public.income_sources enable row level security;

create policy "income_sources_select" on public.income_sources
  for select using (public.is_household_member(household_id));
create policy "income_sources_insert" on public.income_sources
  for insert with check (public.is_household_member(household_id));
create policy "income_sources_update" on public.income_sources
  for update using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));
create policy "income_sources_delete" on public.income_sources
  for delete using (public.is_household_member(household_id));
