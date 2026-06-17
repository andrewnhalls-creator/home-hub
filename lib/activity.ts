import { createClient } from "@/lib/supabase/server";

export async function logActivity({
  householdId,
  actorId,
  entityType,
  entityId,
  action,
  summary,
}: {
  householdId: string;
  actorId: string;
  entityType: string;
  entityId?: string | null;
  action: string;
  summary: string;
}): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("activity_log").insert({
      household_id: householdId,
      actor_id: actorId,
      entity_type: entityType,
      entity_id: entityId ?? null,
      action,
      summary,
    });
  } catch {
    // Best-effort — never let activity logging break the main operation
  }
}
