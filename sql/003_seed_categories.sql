-- Home Hub: default category seeding
-- public.seed_default_categories(household_id) is defined in
-- 001_initial_schema.sql. This trigger calls it automatically whenever a
-- new household is created, regardless of insert path (create_household
-- RPC or any future direct insert), so a household never ends up without
-- its starter categories.

create function public.handle_new_household()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_default_categories(new.id);
  return new;
end;
$$;

create trigger on_household_created
  after insert on public.households
  for each row execute function public.handle_new_household();
