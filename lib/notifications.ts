import { createClient } from "@/lib/supabase/server";

interface ScheduleParams {
  householdId: string;
  userId: string | null;
  category: string;
  entityType: string;
  entityId: string;
  scheduledFor: string;
  title: string;
  body?: string;
}

export async function cancelScheduledNotifications(entityType: string, entityId: string) {
  const supabase = await createClient();
  await supabase
    .from("scheduled_notifications")
    .delete()
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("status", "pendiente");
}

export async function upsertScheduledNotification(params: ScheduleParams) {
  await cancelScheduledNotifications(params.entityType, params.entityId);

  const supabase = await createClient();
  const idempotencyKey = `${params.entityType}:${params.entityId}:${params.scheduledFor}`;

  await supabase.from("scheduled_notifications").insert({
    household_id: params.householdId,
    user_id: params.userId,
    category: params.category,
    entity_type: params.entityType,
    entity_id: params.entityId,
    scheduled_for: params.scheduledFor,
    title: params.title,
    body: params.body ?? null,
    idempotency_key: idempotencyKey,
  });
}
