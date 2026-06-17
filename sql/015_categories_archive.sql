-- Home Hub: add archive support to categories
-- Categories can be archived (hidden from new item creation) but never
-- hard-deleted when in use. archived_at is null = active.

alter table public.categories
  add column archived_at timestamptz,
  add column archived_by uuid references auth.users(id);
