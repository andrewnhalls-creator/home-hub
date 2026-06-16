import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ShoppingList } from "@/components/shopping/ShoppingList";

export default async function ShoppingPage() {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const [{ data: items }, { data: categories }] = await Promise.all([
    supabase
      .from("shopping_items")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("*")
      .eq("household_id", householdId)
      .eq("module", "shopping")
      .order("name", { ascending: true }),
  ]);

  return <ShoppingList items={items ?? []} categories={categories ?? []} />;
}
