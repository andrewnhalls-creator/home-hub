-- 020: per-member voting on wishlist items
-- Adds a JSONB votes column keyed by user_id with values "quiero" | "no_ahora".
-- Status is recomputed in the app layer after each vote.

alter table public.wishlist_items
  add column if not exists votes jsonb not null default '{}';
