-- Home Hub: calendar module
-- See DATA_MODEL.md "calendar_events" and "Calendar event privacy exception".

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  description text,
  event_date date not null,
  event_time time,
  is_all_day boolean default false,
  repeat_frequency text check (
    repeat_frequency in ('ninguna', 'diaria', 'semanal', 'mensual', 'anual')
  ) default 'ninguna',
  remind_before_minutes int,
  is_private boolean default false,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id)
);

create index calendar_events_household_date_idx on public.calendar_events (household_id, event_date);

create trigger set_updated_at before update on public.calendar_events
  for each row execute function public.set_updated_at();

alter table public.calendar_events enable row level security;

-- The is_private exception: a private event is visible/editable only by
-- its creator, even though every other table in this schema is fully
-- shared between household members.
create policy "calendar_events_select" on public.calendar_events
  for select using (
    public.is_household_member(household_id)
    and (not is_private or created_by = (select auth.uid()))
  );

create policy "calendar_events_insert" on public.calendar_events
  for insert with check (public.is_household_member(household_id));

create policy "calendar_events_update" on public.calendar_events
  for update using (
    public.is_household_member(household_id)
    and (not is_private or created_by = (select auth.uid()))
  ) with check (
    public.is_household_member(household_id)
    and (not is_private or created_by = (select auth.uid()))
  );

create policy "calendar_events_delete" on public.calendar_events
  for delete using (
    public.is_household_member(household_id)
    and (not is_private or created_by = (select auth.uid()))
  );
