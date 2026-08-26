import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "@/components/settings/SettingsView";

export default async function SettingsPage() {
  const { user, householdId, householdName, role } = await requireHousehold();
  const supabase = await createClient();

  const [
    { data: household },
    { data: members },
    { data: profile },
    { data: invites },
    { data: allMemberships },
  ] = await Promise.all([
    supabase.from("households").select("*").eq("id", householdId).single(),
    supabase
      .from("household_members")
      .select("id, user_id, role, display_name, created_at")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true }),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("household_invites")
      .select("id, expires_at, max_uses, use_count")
      .eq("household_id", householdId)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("household_members")
      .select("household_id, role, households(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  return (
    <SettingsView
      household={household ?? { name: householdName, locale: "es-ES", currency: "EUR" }}
      members={members ?? []}
      profile={profile}
      currentUserId={user.id}
      role={role}
      initialInvite={invites?.find((i) => i.use_count < i.max_uses) ?? null}
      allMemberships={(allMemberships ?? []) as unknown as { household_id: string; role: "owner" | "member"; households: { name: string } | null }[]}
      activeHouseholdId={householdId}
    />
  );
}
