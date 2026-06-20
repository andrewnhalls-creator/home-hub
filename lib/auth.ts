import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { HouseholdRole } from "@/lib/types";

export async function requireHousehold() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    redirect("/auth/login");
  }

  // Resolve active household from profile first, then fall back to first membership
  const { data: profile } = await supabase
    .from("profiles")
    .select("active_household_id")
    .eq("id", user.id)
    .single();

  const activeId = profile?.active_household_id as string | null;

  let query = supabase
    .from("household_members")
    .select("household_id, role, households(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (activeId) {
    query = query.eq("household_id", activeId);
  }

  const { data: membership } = await query.limit(1).maybeSingle();

  if (!membership) {
    redirect("/onboarding");
  }

  const household = membership.households as unknown as { name: string } | null;

  return {
    user,
    householdId: membership.household_id as string,
    householdName: household?.name ?? "",
    role: membership.role as HouseholdRole,
  };
}
