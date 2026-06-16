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

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id, role, households(name)")
    .eq("user_id", user.id)
    .maybeSingle();

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
