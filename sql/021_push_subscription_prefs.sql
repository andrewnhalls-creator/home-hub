-- 021: per-device sound and vibration preferences for push notifications
alter table public.push_subscriptions
  add column if not exists sound_enabled boolean not null default true,
  add column if not exists vibration_enabled boolean not null default true;
