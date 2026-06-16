import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NotificationsSettings } from "@/components/settings/NotificationsSettings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notificaciones — Home Hub",
};

export default async function NotificacionesPage() {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .eq("household_id", householdId)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-brown">Notificaciones</h1>
        <p className="mt-1 text-sm text-muted">Gestiona los avisos que recibes en este dispositivo.</p>
      </div>
      <NotificationsSettings initialPrefs={prefs} />
    </div>
  );
}
