-- Home Hub: category_id foreign keys should not block category deletion
-- Discovered while testing: categories are cascade-deleted with their
-- household, but any other row still referencing a category_id (e.g.
-- recipe_ingredients) blocked that cascade with a NO ACTION foreign key.
-- The same would happen for a future "delete category" Settings feature.
-- Switch every category_id FK to ON DELETE SET NULL so deleting a
-- category un-categorizes existing rows instead of failing.

alter table public.shopping_items
  drop constraint shopping_items_category_id_fkey,
  add constraint shopping_items_category_id_fkey
    foreign key (category_id) references public.categories(id) on delete set null;

alter table public.recipe_ingredients
  drop constraint recipe_ingredients_category_id_fkey,
  add constraint recipe_ingredients_category_id_fkey
    foreign key (category_id) references public.categories(id) on delete set null;

alter table public.reminders
  drop constraint reminders_category_id_fkey,
  add constraint reminders_category_id_fkey
    foreign key (category_id) references public.categories(id) on delete set null;

alter table public.fixed_payments
  drop constraint fixed_payments_category_id_fkey,
  add constraint fixed_payments_category_id_fkey
    foreign key (category_id) references public.categories(id) on delete set null;

alter table public.expenses
  drop constraint expenses_category_id_fkey,
  add constraint expenses_category_id_fkey
    foreign key (category_id) references public.categories(id) on delete set null;

alter table public.subscriptions
  drop constraint subscriptions_category_id_fkey,
  add constraint subscriptions_category_id_fkey
    foreign key (category_id) references public.categories(id) on delete set null;
