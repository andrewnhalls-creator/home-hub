import { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AppGroupLayout({ children }: { children: ReactNode }) {
  const { user, householdName, householdId } = await requireHousehold();
  const supabase = await createClient();

  const [{ data: notifications }, { count: unreadCount }] = await Promise.all([
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
  ]);

  return (
    <>
      <ServiceWorkerRegistration />
      <AppShell
        householdId={householdId}
        householdName={householdName}
        notifications={notifications ?? []}
        unreadCount={unreadCount ?? 0}
      >
        {children}
      </AppShell>
    </>
  );
}
