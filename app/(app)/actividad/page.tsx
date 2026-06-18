import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import type { ActivityLogEntry } from "@/lib/types";

export default async function ActividadPage() {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const [{ data: entries }, { data: members }] = await Promise.all([
    supabase
      .from("activity_log")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("household_members")
      .select("user_id, display_name")
      .eq("household_id", householdId),
  ]);

  const memberMap: Record<string, string> = {};
  for (const m of members ?? []) {
    memberMap[m.user_id] = m.display_name ?? "Miembro";
  }

  return <ActivityFeed entries={(entries ?? []) as ActivityLogEntry[]} memberMap={memberMap} />;
}
