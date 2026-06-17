import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CategoriasView } from "@/components/settings/CategoriasView";

export default async function CategoriasPage() {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, module, name, color, is_default, archived_at")
    .eq("household_id", householdId)
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });

  return <CategoriasView categories={categories ?? []} />;
}
