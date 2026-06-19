-- Additive: track which meal-plan week generated a shopping list.
-- Non-null means the list was created via "Generar lista" from the menu planner.
-- Used to render the reverse "← Ver semana del menú" link on the list detail page.
alter table public.shopping_lists
  add column if not exists source_menu_week_start date;
