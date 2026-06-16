-- Home Hub: soft delete / archive columns for existing tables
-- See DATA_MODEL.md "Soft delete and archiving". Plain nullable columns;
-- the app is responsible for filtering deleted_at is null in queries.

alter table public.fixed_payments
  add column deleted_at timestamptz,
  add column deleted_by uuid references auth.users(id);

alter table public.expenses
  add column deleted_at timestamptz,
  add column deleted_by uuid references auth.users(id);

alter table public.savings_goals
  add column deleted_at timestamptz,
  add column deleted_by uuid references auth.users(id);

alter table public.subscriptions
  add column deleted_at timestamptz,
  add column deleted_by uuid references auth.users(id);

alter table public.household_documents
  add column archived_at timestamptz,
  add column archived_by uuid references auth.users(id),
  add column deleted_at timestamptz,
  add column deleted_by uuid references auth.users(id);

alter table public.reminders
  add column deleted_at timestamptz,
  add column deleted_by uuid references auth.users(id);
