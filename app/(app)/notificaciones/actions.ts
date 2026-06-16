"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";

export async function markNotificationRead(notificationId: string) {
  const { user } = await requireHousehold();
  const supabase = await createClient();

  await supabase
    .from("notification_events")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  revalidatePath("/", "layout");
}

export async function markAllNotificationsRead() {
  const { user } = await requireHousehold();
  const supabase = await createClient();

  await supabase
    .from("notification_events")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("is_read", false);

  revalidatePath("/", "layout");
}
