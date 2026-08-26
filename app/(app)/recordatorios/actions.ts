"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { reminderSchema } from "@/lib/validations/reminders";
import { upsertScheduledNotification, cancelScheduledNotifications } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";
import {
  advanceInstant,
  instantFromLocalDateTime,
  type RecurrenceFrequency,
} from "@/lib/recurrence";

export interface ReminderFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

function combineDueAt(dueDate?: string, dueTime?: string): string | null {
  if (!dueDate) return null;
  return instantFromLocalDateTime(dueDate, dueTime || "09:00");
}

// Month-end anchor for mensual/anual rules (see lib/recurrence.ts).
function anchorDayFor(frequency: string, dueDate?: string): number | null {
  if (!dueDate || (frequency !== "mensual" && frequency !== "anual")) return null;
  return parseInt(dueDate.slice(8, 10), 10);
}

async function scheduleReminderNotification(
  reminderId: string,
  householdId: string,
  assignedTo: string | null,
  title: string,
  dueAt: string | null,
) {
  if (!dueAt) {
    await cancelScheduledNotifications("reminder", reminderId);
    return;
  }
  await upsertScheduledNotification({
    householdId,
    userId: assignedTo,
    category: "recordatorios",
    entityType: "reminder",
    entityId: reminderId,
    scheduledFor: dueAt,
    title: "Recordatorio",
    body: title,
  });
}

export async function createReminder(
  _prevState: ReminderFormState,
  formData: FormData,
): Promise<ReminderFormState> {
  const parsed = reminderSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    dueTime: formData.get("dueTime") || undefined,
    assignedTo: formData.get("assignedTo") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    repeatFrequency: formData.get("repeatFrequency") || "ninguna",
  });

  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();
  const dueAt = combineDueAt(parsed.data.dueDate, parsed.data.dueTime);

  const { data, error } = await supabase
    .from("reminders")
    .insert({
      household_id: householdId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      due_at: dueAt,
      assigned_to: parsed.data.assignedTo || null,
      category_id: parsed.data.categoryId || null,
      repeat_frequency: parsed.data.repeatFrequency,
      anchor_day: anchorDayFor(parsed.data.repeatFrequency, parsed.data.dueDate),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "No se ha podido guardar. Inténtalo de nuevo." };
  }

  await scheduleReminderNotification(data.id, householdId, parsed.data.assignedTo || null, parsed.data.title, dueAt);

  await supabase.from("activity_log").insert({
    household_id: householdId,
    actor_id: user.id,
    entity_type: "reminder",
    action: "created",
    summary: `Añadió un recordatorio: ${parsed.data.title}`,
  });

  revalidatePath("/recordatorios");
  return { success: true };
}

export async function updateReminder(
  reminderId: string,
  _prevState: ReminderFormState,
  formData: FormData,
): Promise<ReminderFormState> {
  const parsed = reminderSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    dueTime: formData.get("dueTime") || undefined,
    assignedTo: formData.get("assignedTo") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    repeatFrequency: formData.get("repeatFrequency") || "ninguna",
  });

  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const { householdId } = await requireHousehold();
  const supabase = await createClient();
  const dueAt = combineDueAt(parsed.data.dueDate, parsed.data.dueTime);

  const { error } = await supabase
    .from("reminders")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      due_at: dueAt,
      assigned_to: parsed.data.assignedTo || null,
      category_id: parsed.data.categoryId || null,
      repeat_frequency: parsed.data.repeatFrequency,
      anchor_day: anchorDayFor(parsed.data.repeatFrequency, parsed.data.dueDate),
    })
    .eq("id", reminderId)
    .eq("household_id", householdId);

  if (error) {
    return { error: "No se ha podido guardar. Inténtalo de nuevo." };
  }

  await scheduleReminderNotification(reminderId, householdId, parsed.data.assignedTo || null, parsed.data.title, dueAt);

  revalidatePath("/recordatorios");
  return { success: true };
}

export async function toggleReminderStatus(reminderId: string, isDone: boolean) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: reminder } = await supabase
    .from("reminders")
    .select("title, due_at, assigned_to, repeat_frequency, anchor_day")
    .eq("id", reminderId)
    .eq("household_id", householdId)
    .single();

  if (!reminder) return;

  if (!isDone) {
    await supabase
      .from("reminders")
      .update({ status: "pendiente" })
      .eq("id", reminderId)
      .eq("household_id", householdId);
    revalidatePath("/recordatorios");
    return;
  }

  // Record the completed occurrence (idempotent: re-completing the same
  // occurrence refreshes actor/time instead of duplicating history).
  await supabase.from("reminder_completions").upsert(
    {
      reminder_id: reminderId,
      household_id: householdId,
      occurrence_key: reminder.due_at ?? "once",
      due_at: reminder.due_at,
      completed_at: new Date().toISOString(),
      completed_by: user.id,
    },
    { onConflict: "reminder_id,occurrence_key" },
  );

  const isRecurring = reminder.repeat_frequency !== "ninguna" && reminder.due_at;

  if (isRecurring) {
    const nextDueAt = advanceInstant(
      reminder.due_at,
      reminder.repeat_frequency as RecurrenceFrequency,
      reminder.anchor_day,
    );
    // Guarded advance: only from the occurrence we just completed, so a
    // concurrent duplicate completion can never double-advance the series.
    const { data: advanced } = await supabase
      .from("reminders")
      .update({ status: "pendiente", due_at: nextDueAt })
      .eq("id", reminderId)
      .eq("household_id", householdId)
      .eq("due_at", reminder.due_at)
      .select("id");

    if (advanced?.length) {
      await scheduleReminderNotification(
        reminderId,
        householdId,
        reminder.assigned_to,
        reminder.title,
        nextDueAt,
      );
    }
  } else {
    await supabase
      .from("reminders")
      .update({ status: "hecho" })
      .eq("id", reminderId)
      .eq("household_id", householdId);
    await cancelScheduledNotifications("reminder", reminderId);
  }

  void logActivity({ householdId, actorId: user.id, entityType: "reminder", entityId: reminderId, action: "completed", summary: `Completó el recordatorio: ${reminder.title}` });

  revalidatePath("/recordatorios");
}

export async function snoozeReminder(reminderId: string, minutes: number) {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: reminder } = await supabase
    .from("reminders")
    .select("title, due_at, assigned_to")
    .eq("id", reminderId)
    .single();

  if (!reminder) return;

  const base = reminder.due_at ? new Date(reminder.due_at) : new Date();
  const newDueAt = new Date(base.getTime() + minutes * 60 * 1000).toISOString();

  await supabase
    .from("reminders")
    .update({ due_at: newDueAt, status: "pendiente" })
    .eq("id", reminderId)
    .eq("household_id", householdId);

  await scheduleReminderNotification(reminderId, householdId, reminder.assigned_to, reminder.title, newDueAt);

  revalidatePath("/recordatorios");
}

export async function deleteReminder(reminderId: string) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: reminder } = await supabase.from("reminders").select("title").eq("id", reminderId).single();

  await supabase
    .from("reminders")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
    .eq("id", reminderId)
    .eq("household_id", householdId);

  await Promise.all([
    cancelScheduledNotifications("reminder", reminderId),
    supabase
      .from("notification_events")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("entity_type", "reminder")
      .eq("entity_id", reminderId)
      .eq("is_read", false),
  ]);
  void logActivity({ householdId, actorId: user.id, entityType: "reminder", entityId: reminderId, action: "deleted", summary: `Eliminó el recordatorio: ${reminder?.title ?? reminderId}` });

  revalidatePath("/recordatorios");
}

export async function restoreReminder(
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const reminderId = formData.get("id") as string;
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase
    .from("reminders")
    .update({ deleted_at: null, deleted_by: null })
    .eq("id", reminderId)
    .eq("household_id", householdId);

  if (error) return { error: "No se ha podido restaurar." };

  revalidatePath("/recordatorios");
  return {};
}

function flattenFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
