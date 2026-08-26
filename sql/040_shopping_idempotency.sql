-- 040: Shopping idempotency + transactional quick purchase (backend slice B2.2)
-- APPLIED 2026-08-26 as remote migration 040_shopping_idempotency.
-- - shopping_mutations: client-generated UUID mutation ids; a replayed offline
--   mutation conflicts on the primary key and the server action returns
--   current authoritative state instead of re-applying.
-- - finish_quick_purchase(): expense creation + clearing bought standing-list
--   items in ONE transaction (previously two writes; a mid-flight failure +
--   retry could duplicate the expense). SECURITY INVOKER — caller's RLS.
-- Conflict semantics live in app/(app)/compra/actions.ts:
-- toggleShoppingItemComplete(itemId, isCompleted, {mutationId, baseVersion})
-- uses the B1.1 trigger-maintained version column: stale baseVersion + same
-- resulting state = idempotent success; stale + divergent state = Spanish
-- conflict payload for the refresh UI.

create table if not exists public.shopping_mutations (
  id uuid primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  item_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists idx_shopping_mutations_household_created
  on public.shopping_mutations (household_id, created_at);

alter table public.shopping_mutations enable row level security;
create policy "shopping_mutations_select" on public.shopping_mutations
  for select using (public.is_household_member(household_id));
create policy "shopping_mutations_insert" on public.shopping_mutations
  for insert with check (public.is_household_member(household_id));

create or replace function public.finish_quick_purchase(p_amount_cents integer)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_household uuid;
  v_category uuid;
  v_expense uuid;
begin
  select active_household_id into v_household from public.profiles where id = auth.uid();
  if v_household is null then
    raise exception 'No autorizado';
  end if;
  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'Importe no válido';
  end if;

  select id into v_category
  from public.categories
  where household_id = v_household and module = 'finance' and name = 'Supermercado'
  limit 1;

  insert into public.expenses (household_id, title, amount, expense_date, category_id, paid_by, created_by)
  values (v_household, 'Compra del súper', p_amount_cents / 100.0,
          (now() at time zone 'Europe/Madrid')::date, v_category, auth.uid(), auth.uid())
  returning id into v_expense;

  delete from public.shopping_items
  where household_id = v_household and is_completed and shopping_list_id is null;

  insert into public.activity_log (household_id, actor_id, entity_type, entity_id, action, summary)
  values (v_household, auth.uid(), 'expense', v_expense, 'created', 'Registró la compra del súper');

  return v_expense;
end;
$$;

revoke execute on function public.finish_quick_purchase(integer) from public, anon;
