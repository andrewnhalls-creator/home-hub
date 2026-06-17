import Link from "next/link";
import { Receipt, X } from "lucide-react";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ShoppingList } from "@/components/shopping/ShoppingList";

export default async function ShoppingPage({
  searchParams,
}: {
  searchParams: Promise<{ lista?: string }>;
}) {
  const { householdId } = await requireHousehold();
  const { lista: shoppingListId } = await searchParams;
  const supabase = await createClient();

  let itemsQuery = supabase
    .from("shopping_items")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  if (shoppingListId) {
    itemsQuery = itemsQuery.eq("shopping_list_id", shoppingListId);
  }

  const [{ data: items }, { data: categories }, listResult] = await Promise.all([
    itemsQuery,
    supabase
      .from("categories")
      .select("*")
      .eq("household_id", householdId)
      .eq("module", "shopping")
      .order("name", { ascending: true }),
    shoppingListId
      ? supabase.from("shopping_lists").select("name").eq("id", shoppingListId).single()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      {shoppingListId && listResult.data ? (
        <div className="flex items-center justify-between rounded-xl border border-terracotta bg-card px-4 py-3">
          <p className="text-sm font-medium text-brown">Lista: {listResult.data.name}</p>
          <Link href="/compra" aria-label="Quitar filtro" className="text-muted">
            <X className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <Link
          href="/compra/listas"
          className="flex items-center justify-center gap-2 rounded-xl border border-terracotta px-4 py-3 text-sm font-medium text-terracotta"
        >
          <Receipt className="h-4 w-4" aria-hidden />
          Historial de compras
        </Link>
      )}
      <ShoppingList items={items ?? []} categories={categories ?? []} householdId={householdId} shoppingListId={shoppingListId} />
    </div>
  );
}
