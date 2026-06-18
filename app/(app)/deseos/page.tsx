import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { WishlistList } from "@/components/wishlist/WishlistList";
import type { WishlistItem } from "@/lib/types";

export default async function WishlistPage() {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const [{ data: items }, { data: members }] = await Promise.all([
    supabase
      .from("wishlist_items")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false }),
    supabase
      .from("household_members")
      .select("user_id, display_name")
      .eq("household_id", householdId),
  ]);

  return (
    <WishlistList
      items={(items ?? []) as WishlistItem[]}
      members={members ?? []}
      currentUserId={user.id}
    />
  );
}
