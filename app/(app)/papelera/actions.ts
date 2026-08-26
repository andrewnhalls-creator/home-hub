"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";

export interface EmptyTrashState {
  error?: string;
  purged?: number;
}

// Owner-only permanent purge of everything in the papelera (user decision
// 26/08/2026: manual "Vaciar" with confirmation; no auto-purge). The heavy
// lifting is the empty_trash() database function (migration 046) — atomic,
// with its own owner check and activity record.
export async function emptyTrash(): Promise<EmptyTrashState> {
  const { role } = await requireHousehold();
  if (role !== "owner") {
    return { error: "Solo la persona propietaria del hogar puede vaciar la papelera." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("empty_trash");

  if (error) {
    return { error: "No se ha podido vaciar la papelera. Inténtalo de nuevo." };
  }

  revalidatePath("/papelera");
  revalidatePath("/finanzas");
  return { purged: (data as number) ?? 0 };
}
