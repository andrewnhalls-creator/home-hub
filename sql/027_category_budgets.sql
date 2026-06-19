-- Home Hub: category_budgets table
-- Stores per-category monthly budget targets for the Presupuestos tab.
-- Unique per household+category; uses soft-delete-free approach (just delete the row).

CREATE TABLE IF NOT EXISTS public.category_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  monthly_amount numeric(12, 2) NOT NULL,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(household_id, category_id)
);

CREATE INDEX IF NOT EXISTS category_budgets_household_idx ON public.category_budgets (household_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.category_budgets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "category_budgets_select" ON public.category_budgets
  FOR SELECT USING (public.is_household_member(household_id));
CREATE POLICY "category_budgets_insert" ON public.category_budgets
  FOR INSERT WITH CHECK (public.is_household_member(household_id));
CREATE POLICY "category_budgets_update" ON public.category_budgets
  FOR UPDATE USING (public.is_household_member(household_id))
  WITH CHECK (public.is_household_member(household_id));
CREATE POLICY "category_budgets_delete" ON public.category_budgets
  FOR DELETE USING (public.is_household_member(household_id));
