-- Home Hub: notification infrastructure schema
-- See DATA_MODEL.md notification_preferences / push_subscriptions /
-- notification_events / notification_delivery_attempts /
-- scheduled_notifications, and SECURITY_AND_PRIVACY.md "Push notification
-- security". Tables only in this migration — service worker, Edge
-- Function, and Cron come in a later milestone.

create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  push_enabled boolean default true,
  categories jsonb not null default '{
    "recordatorios": true, "calendario": true, "tareas": true,
    "pagos": true, "suscripciones": true, "documentos": true,
    "menu": true, "compra": true, "actividad_hogar": true,
    "resumen_diario": true, "resumen_semanal": true
  }'::jsonb,
  lead_time_minutes int default 30,
  quiet_hours_start time,
  quiet_hours_end time,
  only_assigned_to_me boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (household_id, user_id)
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  device_name text,
  user_agent text,
  is_active boolean default true,
  last_seen_at timestamptz default now(),
  created_at timestamptz default now(),
  deactivated_at timestamptz
);

create table public.notification_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (
    category in (
      'recordatorios', 'calendario', 'tareas', 'pagos', 'suscripciones',
      'documentos', 'menu', 'compra', 'actividad_hogar', 'resumen_diario',
      'resumen_semanal'
    )
  ),
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  is_read boolean default false,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table public.notification_delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  notification_event_id uuid references public.notification_events(id) on delete cascade,
  push_subscription_id uuid references public.push_subscriptions(id) on delete cascade,
  status text check (status in ('pendiente', 'enviado', 'fallido')) default 'pendiente',
  status_code int,
  error_message text,
  attempted_at timestamptz default now()
);

create table public.scheduled_notifications (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  category text not null check (
    category in (
      'recordatorios', 'calendario', 'tareas', 'pagos', 'suscripciones',
      'documentos', 'menu', 'compra', 'actividad_hogar', 'resumen_diario',
      'resumen_semanal'
    )
  ),
  entity_type text,
  entity_id uuid,
  scheduled_for timestamptz not null,
  title text not null,
  body text,
  status text check (
    status in ('pendiente', 'procesando', 'enviado', 'fallido', 'cancelado')
  ) default 'pendiente',
  processed_at timestamptz,
  idempotency_key text not null unique,
  created_at timestamptz default now()
);

create index notification_events_user_read_idx on public.notification_events (user_id, is_read);
create index notification_events_household_created_idx on public.notification_events (household_id, created_at desc);
create index push_subscriptions_user_idx on public.push_subscriptions (user_id);
create index push_subscriptions_household_idx on public.push_subscriptions (household_id);
create index scheduled_notifications_status_scheduled_idx on public.scheduled_notifications (status, scheduled_for);
create index notification_delivery_attempts_event_idx on public.notification_delivery_attempts (notification_event_id);

create trigger set_updated_at before update on public.notification_preferences
  for each row execute function public.set_updated_at();

alter table public.notification_preferences enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notification_events enable row level security;
alter table public.notification_delivery_attempts enable row level security;
alter table public.scheduled_notifications enable row level security;

-- notification_preferences / push_subscriptions: a user manages only
-- their own rows, never their partner's, even within the same household.
create policy "notification_preferences_select" on public.notification_preferences
  for select using (public.is_household_member(household_id) and user_id = (select auth.uid()));
create policy "notification_preferences_insert" on public.notification_preferences
  for insert with check (public.is_household_member(household_id) and user_id = (select auth.uid()));
create policy "notification_preferences_update" on public.notification_preferences
  for update using (public.is_household_member(household_id) and user_id = (select auth.uid()))
  with check (public.is_household_member(household_id) and user_id = (select auth.uid()));
create policy "notification_preferences_delete" on public.notification_preferences
  for delete using (public.is_household_member(household_id) and user_id = (select auth.uid()));

create policy "push_subscriptions_select" on public.push_subscriptions
  for select using (public.is_household_member(household_id) and user_id = (select auth.uid()));
create policy "push_subscriptions_insert" on public.push_subscriptions
  for insert with check (public.is_household_member(household_id) and user_id = (select auth.uid()));
create policy "push_subscriptions_update" on public.push_subscriptions
  for update using (public.is_household_member(household_id) and user_id = (select auth.uid()))
  with check (public.is_household_member(household_id) and user_id = (select auth.uid()));
create policy "push_subscriptions_delete" on public.push_subscriptions
  for delete using (public.is_household_member(household_id) and user_id = (select auth.uid()));

-- notification_events: a user's own notification feed. Any household
-- member's action can create an event for another member (e.g. a shared
-- reminder), but only the recipient can read/mark it.
create policy "notification_events_select" on public.notification_events
  for select using (user_id = (select auth.uid()));
create policy "notification_events_insert" on public.notification_events
  for insert with check (public.is_household_member(household_id));
create policy "notification_events_update" on public.notification_events
  for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- notification_delivery_attempts: read-only for household members (via
-- the parent event), written only by the Edge Function's service role
-- (which bypasses RLS) — no insert/update/delete policy for client roles.
create policy "notification_delivery_attempts_select" on public.notification_delivery_attempts
  for select using (
    exists (
      select 1 from public.notification_events e
      where e.id = notification_event_id and e.user_id = (select auth.uid())
    )
  );

-- scheduled_notifications: household members can see and manage their
-- household's queue (including personal/household-wide rows); the Edge
-- Function processes rows as the service role regardless of these policies.
create policy "scheduled_notifications_select" on public.scheduled_notifications
  for select using (public.is_household_member(household_id));
create policy "scheduled_notifications_insert" on public.scheduled_notifications
  for insert with check (public.is_household_member(household_id));
create policy "scheduled_notifications_update" on public.scheduled_notifications
  for update using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "scheduled_notifications_delete" on public.scheduled_notifications
  for delete using (public.is_household_member(household_id));
