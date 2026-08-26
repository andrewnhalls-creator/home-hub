-- 034: Optimistic-concurrency groundwork (backend slice B1.1, part b)
-- STATUS: NOT YET APPLIED — the MCP auto-mode permission classifier blocked
-- ALTER TABLE/trigger DDL against the live project. Apply after user approval
-- via `mcp apply_migration` (name: 034_version_updated_by) with this exact SQL.
--
-- Adds server-maintained `version` + `updated_by` to the eight collision-prone
-- tables (spec: optimistic concurrency for collision-prone edits). The new
-- set_updated_meta trigger coexists with the existing set_updated_at trigger
-- (both BEFORE UPDATE; duplicate updated_at stamping is harmless). Clients are
-- never trusted for these fields.

alter table public.expenses
  add column if not exists updated_at timestamptz not null default now();

alter table public.shopping_items
  add column if not exists version integer not null default 1,
  add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.calendar_events
  add column if not exists version integer not null default 1,
  add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.reminders
  add column if not exists version integer not null default 1,
  add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.chores
  add column if not exists version integer not null default 1,
  add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.recipes
  add column if not exists version integer not null default 1,
  add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.fixed_payments
  add column if not exists version integer not null default 1,
  add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.expenses
  add column if not exists version integer not null default 1,
  add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.subscriptions
  add column if not exists version integer not null default 1,
  add column if not exists updated_by uuid references auth.users(id) on delete set null;

-- Covering indexes for the new updated_by FKs (keep advisor 0001 clean).
create index if not exists idx_shopping_items_updated_by on shopping_items (updated_by);
create index if not exists idx_calendar_events_updated_by on calendar_events (updated_by);
create index if not exists idx_reminders_updated_by on reminders (updated_by);
create index if not exists idx_chores_updated_by on chores (updated_by);
create index if not exists idx_recipes_updated_by on recipes (updated_by);
create index if not exists idx_fixed_payments_updated_by on fixed_payments (updated_by);
create index if not exists idx_expenses_updated_by on expenses (updated_by);
create index if not exists idx_subscriptions_updated_by on subscriptions (updated_by);

-- version increments on every update regardless of client payload; updated_by
-- is stamped only for authenticated users (cron/service updates keep the last
-- human author).
create or replace function public.set_updated_meta()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  new.version := coalesce(old.version, 0) + 1;
  if auth.uid() is not null then
    new.updated_by := auth.uid();
  else
    new.updated_by := old.updated_by;
  end if;
  return new;
end;
$$;

revoke execute on function public.set_updated_meta() from public, anon;

create trigger set_updated_meta before update on public.shopping_items
  for each row execute function public.set_updated_meta();
create trigger set_updated_meta before update on public.calendar_events
  for each row execute function public.set_updated_meta();
create trigger set_updated_meta before update on public.reminders
  for each row execute function public.set_updated_meta();
create trigger set_updated_meta before update on public.chores
  for each row execute function public.set_updated_meta();
create trigger set_updated_meta before update on public.recipes
  for each row execute function public.set_updated_meta();
create trigger set_updated_meta before update on public.fixed_payments
  for each row execute function public.set_updated_meta();
create trigger set_updated_meta before update on public.expenses
  for each row execute function public.set_updated_meta();
create trigger set_updated_meta before update on public.subscriptions
  for each row execute function public.set_updated_meta();
