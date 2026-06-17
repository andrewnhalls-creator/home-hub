# Next Steps

## Deploy pending
All post-launch items (`9d04dd2`) need deploying:
```
cd /Users/dianezhalls/Projects/home-hub && npx vercel --prod
```

---

## Next (and final): Push notification quiet hours / per-category toggles

Currently all push notifications fire at any time of day with no user control.
Goal: let users set quiet hours and optionally mute individual notification categories.

### What to build
1. **Quiet hours** — a time range (e.g. 23:00–08:00) stored per user in Supabase.
   The Edge Function that sends pushes checks the recipient's quiet hours before delivering.

2. **Per-category mutes** — a set of notification categories (reminders, pagos, tareas…)
   the user can individually silence, stored per user.

### Schema needed
New table `notification_preferences`:
```sql
create table notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  quiet_hours_enabled boolean not null default false,
  quiet_start time not null default '23:00',
  quiet_end   time not null default '08:00',
  muted_categories text[] not null default '{}',
  updated_at timestamptz not null default now()
);
-- RLS: user can only read/write their own row
```

### UI
- Add a new section to `/ajustes/notificaciones` — "Horario silencioso" toggle + time pickers
- Category mute checkboxes below (Recordatorios, Tareas, Pagos, etc.)

### Edge Function change
In `supabase/functions/send-push/index.ts`, before sending to each subscription,
query `notification_preferences` for that `user_id` and skip delivery if:
- `quiet_hours_enabled = true` AND current time (in user's timezone) is within quiet range
- The notification category is in `muted_categories`

---

## Remaining post-launch items
5. **Push notification quiet hours / per-category toggles** ← next (final item)
