-- Home Hub: Row Level Security policies
-- Every table is household-scoped and RLS-enabled. No table is publicly
-- readable. See DATA_MODEL.md "RLS strategy" for the rationale.

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.household_invites enable row level security;
alter table public.categories enable row level security;
alter table public.shopping_items enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.meal_plans enable row level security;
alter table public.reminders enable row level security;
alter table public.chores enable row level security;
alter table public.fixed_payments enable row level security;
alter table public.expenses enable row level security;
alter table public.savings_goals enable row level security;
alter table public.savings_contributions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.household_documents enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.activity_log enable row level security;

-- ---------------------------------------------------------------------------
-- profiles: a user manages their own profile; household members can read
-- each other's profile (for display names/avatars in shared views).
-- ---------------------------------------------------------------------------
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_select_household_members" on public.profiles
  for select using (
    exists (
      select 1
      from public.household_members me
      join public.household_members them on them.household_id = me.household_id
      where me.user_id = auth.uid() and them.user_id = public.profiles.id
    )
  );

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- households: members can read/update; any authenticated user may create
-- one (normally via the create_household RPC). No delete policy in MVP.
-- ---------------------------------------------------------------------------
create policy "households_select_members" on public.households
  for select using (public.is_household_member(id));

create policy "households_update_members" on public.households
  for update using (public.is_household_member(id)) with check (public.is_household_member(id));

create policy "households_insert_authenticated" on public.households
  for insert with check (created_by = auth.uid());

-- ---------------------------------------------------------------------------
-- household_members: members can see the roster; only owners can manage
-- members directly (joining via invite uses the redeem_household_invite
-- security-definer RPC, not this insert policy).
-- ---------------------------------------------------------------------------
create policy "household_members_select_members" on public.household_members
  for select using (public.is_household_member(household_id));

create policy "household_members_insert_owner" on public.household_members
  for insert with check (public.is_household_owner(household_id));

create policy "household_members_update_owner" on public.household_members
  for update using (public.is_household_owner(household_id))
  with check (public.is_household_owner(household_id));

create policy "household_members_delete_owner" on public.household_members
  for delete using (public.is_household_owner(household_id));

-- ---------------------------------------------------------------------------
-- household_invites: owner-only. Redemption happens through the
-- redeem_household_invite RPC so codes are never directly select-able by
-- a non-owner (no enumeration of valid codes).
-- ---------------------------------------------------------------------------
create policy "household_invites_select_owner" on public.household_invites
  for select using (public.is_household_owner(household_id));

create policy "household_invites_insert_owner" on public.household_invites
  for insert with check (public.is_household_owner(household_id));

create policy "household_invites_update_owner" on public.household_invites
  for update using (public.is_household_owner(household_id))
  with check (public.is_household_owner(household_id));

create policy "household_invites_delete_owner" on public.household_invites
  for delete using (public.is_household_owner(household_id));

-- ---------------------------------------------------------------------------
-- generic household-scoped CRUD policy pattern, applied per table below
-- ---------------------------------------------------------------------------
create policy "categories_select" on public.categories
  for select using (public.is_household_member(household_id));
create policy "categories_insert" on public.categories
  for insert with check (public.is_household_member(household_id));
create policy "categories_update" on public.categories
  for update using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "categories_delete" on public.categories
  for delete using (public.is_household_member(household_id));

create policy "shopping_items_select" on public.shopping_items
  for select using (public.is_household_member(household_id));
create policy "shopping_items_insert" on public.shopping_items
  for insert with check (public.is_household_member(household_id));
create policy "shopping_items_update" on public.shopping_items
  for update using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "shopping_items_delete" on public.shopping_items
  for delete using (public.is_household_member(household_id));

create policy "recipes_select" on public.recipes
  for select using (public.is_household_member(household_id));
create policy "recipes_insert" on public.recipes
  for insert with check (public.is_household_member(household_id));
create policy "recipes_update" on public.recipes
  for update using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "recipes_delete" on public.recipes
  for delete using (public.is_household_member(household_id));

-- recipe_ingredients has no household_id column; scope via the parent recipe.
create policy "recipe_ingredients_select" on public.recipe_ingredients
  for select using (
    public.is_household_member((select household_id from public.recipes where id = recipe_id))
  );
create policy "recipe_ingredients_insert" on public.recipe_ingredients
  for insert with check (
    public.is_household_member((select household_id from public.recipes where id = recipe_id))
  );
create policy "recipe_ingredients_update" on public.recipe_ingredients
  for update using (
    public.is_household_member((select household_id from public.recipes where id = recipe_id))
  ) with check (
    public.is_household_member((select household_id from public.recipes where id = recipe_id))
  );
create policy "recipe_ingredients_delete" on public.recipe_ingredients
  for delete using (
    public.is_household_member((select household_id from public.recipes where id = recipe_id))
  );

create policy "meal_plans_select" on public.meal_plans
  for select using (public.is_household_member(household_id));
create policy "meal_plans_insert" on public.meal_plans
  for insert with check (public.is_household_member(household_id));
create policy "meal_plans_update" on public.meal_plans
  for update using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "meal_plans_delete" on public.meal_plans
  for delete using (public.is_household_member(household_id));

create policy "reminders_select" on public.reminders
  for select using (public.is_household_member(household_id));
create policy "reminders_insert" on public.reminders
  for insert with check (public.is_household_member(household_id));
create policy "reminders_update" on public.reminders
  for update using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "reminders_delete" on public.reminders
  for delete using (public.is_household_member(household_id));

create policy "chores_select" on public.chores
  for select using (public.is_household_member(household_id));
create policy "chores_insert" on public.chores
  for insert with check (public.is_household_member(household_id));
create policy "chores_update" on public.chores
  for update using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "chores_delete" on public.chores
  for delete using (public.is_household_member(household_id));

create policy "fixed_payments_select" on public.fixed_payments
  for select using (public.is_household_member(household_id));
create policy "fixed_payments_insert" on public.fixed_payments
  for insert with check (public.is_household_member(household_id));
create policy "fixed_payments_update" on public.fixed_payments
  for update using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "fixed_payments_delete" on public.fixed_payments
  for delete using (public.is_household_member(household_id));

create policy "expenses_select" on public.expenses
  for select using (public.is_household_member(household_id));
create policy "expenses_insert" on public.expenses
  for insert with check (public.is_household_member(household_id));
create policy "expenses_update" on public.expenses
  for update using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "expenses_delete" on public.expenses
  for delete using (public.is_household_member(household_id));

create policy "savings_goals_select" on public.savings_goals
  for select using (public.is_household_member(household_id));
create policy "savings_goals_insert" on public.savings_goals
  for insert with check (public.is_household_member(household_id));
create policy "savings_goals_update" on public.savings_goals
  for update using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "savings_goals_delete" on public.savings_goals
  for delete using (public.is_household_member(household_id));

-- savings_contributions has no household_id column; scope via the parent goal.
create policy "savings_contributions_select" on public.savings_contributions
  for select using (
    public.is_household_member((select household_id from public.savings_goals where id = goal_id))
  );
create policy "savings_contributions_insert" on public.savings_contributions
  for insert with check (
    public.is_household_member((select household_id from public.savings_goals where id = goal_id))
  );
create policy "savings_contributions_update" on public.savings_contributions
  for update using (
    public.is_household_member((select household_id from public.savings_goals where id = goal_id))
  ) with check (
    public.is_household_member((select household_id from public.savings_goals where id = goal_id))
  );
create policy "savings_contributions_delete" on public.savings_contributions
  for delete using (
    public.is_household_member((select household_id from public.savings_goals where id = goal_id))
  );

create policy "subscriptions_select" on public.subscriptions
  for select using (public.is_household_member(household_id));
create policy "subscriptions_insert" on public.subscriptions
  for insert with check (public.is_household_member(household_id));
create policy "subscriptions_update" on public.subscriptions
  for update using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "subscriptions_delete" on public.subscriptions
  for delete using (public.is_household_member(household_id));

create policy "household_documents_select" on public.household_documents
  for select using (public.is_household_member(household_id));
create policy "household_documents_insert" on public.household_documents
  for insert with check (public.is_household_member(household_id));
create policy "household_documents_update" on public.household_documents
  for update using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "household_documents_delete" on public.household_documents
  for delete using (public.is_household_member(household_id));

create policy "wishlist_items_select" on public.wishlist_items
  for select using (public.is_household_member(household_id));
create policy "wishlist_items_insert" on public.wishlist_items
  for insert with check (public.is_household_member(household_id));
create policy "wishlist_items_update" on public.wishlist_items
  for update using (public.is_household_member(household_id)) with check (public.is_household_member(household_id));
create policy "wishlist_items_delete" on public.wishlist_items
  for delete using (public.is_household_member(household_id));

-- activity_log is append-only from the app's perspective: members can read
-- and insert, but never update/delete entries (no policies for those actions).
create policy "activity_log_select" on public.activity_log
  for select using (public.is_household_member(household_id));
create policy "activity_log_insert" on public.activity_log
  for insert with check (public.is_household_member(household_id));
