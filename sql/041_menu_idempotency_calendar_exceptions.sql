-- 041: Menu-generation idempotency + calendar exceptions (backend slice B2.3)
-- APPLIED 2026-08-26 as remote migration 041_menu_idempotency_calendar_exceptions.
-- - One generated shopping list per menu week (unique partial index on
--   household+source_menu_week_start where not deleted); the action reuses the
--   existing list on retry and on 23505 race. Ingredient values are copied, so
--   recipe edits never rewrite an already-generated list.
-- - calendar_event_exceptions: "eliminar solo este día" for recurring events.
--   Calendar expansion (lib/calendar.ts) now runs on lib/recurrence.ts (fixes
--   the date-fns addMonths anchor loss: monthly on day 31 stayed on 28 forever)
--   and skips exception dates. Recurring events now get reminders: armed at
--   create/update/skip for the next occurrence, and the outbox worker re-arms
--   the following occurrence after each delivery (self-perpetuating chain;
--   worker bundles a drift-guarded copy of the engine).
-- - end_date >= event_date check constraint.

create unique index if not exists idx_shopping_lists_menu_week_unique
  on public.shopping_lists (household_id, source_menu_week_start)
  where source_menu_week_start is not null and deleted_at is null;

create table if not exists public.calendar_event_exceptions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.calendar_events(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  occurrence_date date not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (event_id, occurrence_date)
);
create index if not exists idx_calendar_event_exceptions_household_id
  on public.calendar_event_exceptions (household_id);
create index if not exists idx_calendar_event_exceptions_created_by
  on public.calendar_event_exceptions (created_by);

alter table public.calendar_event_exceptions enable row level security;
create policy "calendar_event_exceptions_select" on public.calendar_event_exceptions
  for select using (public.is_household_member(household_id));
create policy "calendar_event_exceptions_insert" on public.calendar_event_exceptions
  for insert with check (public.is_household_member(household_id));
create policy "calendar_event_exceptions_delete" on public.calendar_event_exceptions
  for delete using (public.is_household_member(household_id));

alter table public.calendar_events
  add constraint calendar_events_end_after_start
  check (end_date is null or end_date >= event_date);
