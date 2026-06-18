-- 022: chore completion history for streaks and heatmap
create table if not exists public.chore_completions (
  id uuid primary key default gen_random_uuid(),
  chore_id uuid not null references public.chores(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  completed_at timestamptz not null default now(),
  completed_by uuid references auth.users(id)
);

create index if not exists chore_completions_chore_idx
  on public.chore_completions (chore_id, completed_at desc);

alter table public.chore_completions enable row level security;

create policy "chore_completions_select" on public.chore_completions
  for select using (public.is_household_member(household_id));

create policy "chore_completions_insert" on public.chore_completions
  for insert with check (public.is_household_member(household_id));
