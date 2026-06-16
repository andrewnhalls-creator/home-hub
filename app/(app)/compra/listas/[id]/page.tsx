import { notFound } from "next/navigation";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ShoppingListDetail } from "@/components/shopping/ShoppingListDetail";

export default async function ShoppingListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const [{ data: list }, { data: trips }, { count: itemsCount }] = await Promise.all([
    supabase.from("shopping_lists").select("*").eq("id", id).eq("household_id", householdId).single(),
    supabase
      .from("shopping_trips")
      .select("*")
      .eq("shopping_list_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("shopping_items")
      .select("id", { count: "exact", head: true })
      .eq("shopping_list_id", id),
  ]);

  if (!list) notFound();

  return <ShoppingListDetail list={list} trips={trips ?? []} itemsCount={itemsCount ?? 0} />;
}
