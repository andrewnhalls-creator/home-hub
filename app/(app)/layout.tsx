import { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AppGroupLayout({ children }: { children: ReactNode }) {
  const { user, householdName, householdId, role } = await requireHousehold();
  const supabase = await createClient();

  const [{ data: notifications }, { count: unreadCount }, { data: memberships }] = await Promise.all([
    supabase
      .from("notification_events")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("notification_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false),
    supabase
      .from("household_members")
      .select("household_id, households(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  const householdIds = (memberships ?? []).map((m) => m.household_id as string);
  const { data: memberRows } = householdIds.length
    ? await supabase.from("household_members").select("household_id").in("household_id", householdIds)
    : { data: [] as { household_id: string }[] };
  const memberCounts = new Map<string, number>();
  for (const row of memberRows ?? []) {
    memberCounts.set(row.household_id, (memberCounts.get(row.household_id) ?? 0) + 1);
  }
  const households = (memberships ?? []).map((m) => {
    const rel = m.households as unknown as { name: string } | { name: string }[] | null;
    const name = Array.isArray(rel) ? rel[0]?.name : rel?.name;
    return {
      id: m.household_id as string,
      name: name ?? "Sin nombre",
      memberCount: memberCounts.get(m.household_id as string) ?? 1,
      isActive: m.household_id === householdId,
    };
  });

  return (
    <>
      <ServiceWorkerRegistration />
      <AppShell
        householdId={householdId}
        householdName={householdName}
        userName={(user.user_metadata?.display_name as string | undefined) ?? user.email ?? undefined}
        userRole={role === "owner" ? "owner" : "member"}
        households={households}
        notifications={notifications ?? []}
        unreadCount={unreadCount ?? 0}
      >
        {children}
      </AppShell>
    </>
  );
}
