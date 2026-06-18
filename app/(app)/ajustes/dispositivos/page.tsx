import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DevicesView } from "@/components/settings/DevicesView";

export default async function DispositivosPage() {
  const { user } = await requireHousehold();
  const supabase = await createClient();

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("id, device_name, user_agent, is_active, last_seen_at, created_at, deactivated_at, sound_enabled, vibration_enabled")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <DevicesView subscriptions={subscriptions ?? []} />;
}
