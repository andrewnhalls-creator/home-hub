"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";

export interface DevicesActionState {
  error?: string;
  success?: boolean;
}

export async function removeDevice(
  _prevState: DevicesActionState,
  formData: FormData,
): Promise<DevicesActionState> {
  const subscriptionId = formData.get("subscriptionId") as string;
  if (!subscriptionId) return { error: "Dispositivo no válido." };

  const { user } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase
    .from("push_subscriptions")
    .update({ is_active: false, deactivated_at: new Date().toISOString() })
    .eq("id", subscriptionId)
    .eq("user_id", user.id);

  if (error) return { error: "No se ha podido quitar el dispositivo. Inténtalo de nuevo." };

  revalidatePath("/ajustes/dispositivos");
  return { success: true };
}

export async function removeAllDevices(): Promise<DevicesActionState> {
  const { user } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase
    .from("push_subscriptions")
    .update({ is_active: false, deactivated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (error) return { error: "No se ha podido revocar el acceso. Inténtalo de nuevo." };

  revalidatePath("/ajustes/dispositivos");
  return { success: true };
}
