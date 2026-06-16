"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import type { NotificationCategory } from "@/lib/types";

export async function upsertPushSubscription(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  userAgent: string,
) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  await supabase.from("push_subscriptions").upsert(
    {
      household_id: householdId,
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth_key: subscription.keys.auth,
      user_agent: userAgent,
      is_active: true,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  );
}

export async function removePushSubscription(endpoint: string) {
  const { user } = await requireHousehold();
  const supabase = await createClient();

  await supabase
    .from("push_subscriptions")
    .update({ is_active: false, deactivated_at: new Date().toISOString() })
    .eq("endpoint", endpoint)
    .eq("user_id", user.id);
}

export async function upsertNotificationPreferences(prefs: {
  pushEnabled: boolean;
  categories: Record<NotificationCategory, boolean>;
  leadTimeMinutes: number;
}) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  await supabase.from("notification_preferences").upsert(
    {
      household_id: householdId,
      user_id: user.id,
      push_enabled: prefs.pushEnabled,
      categories: prefs.categories,
      lead_time_minutes: prefs.leadTimeMinutes,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "household_id,user_id" },
  );

  revalidatePath("/ajustes/notificaciones");
}

export async function sendTestNotification() {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  await supabase.from("notification_events").insert({
    household_id: householdId,
    user_id: user.id,
    category: "actividad_hogar",
    title: "Notificación de prueba",
    body: "Las notificaciones push están configuradas correctamente.",
    is_read: false,
  });

  revalidatePath("/", "layout");
}
