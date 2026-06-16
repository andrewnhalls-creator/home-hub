import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { WishlistList } from "@/components/wishlist/WishlistList";

export default async function WishlistPage() {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  return <WishlistList items={items ?? []} />;
}
