"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { choreSchema } from "@/lib/validations/chores";
import { upsertScheduledNotification, cancelScheduledNotifications } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";
import {
  advanceDateOnly,
  instantFromLocalDateTime,
  type RecurrenceFrequency,
} from "@/lib/recurrence";

export interface ChoreFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

async function scheduleChoreNotification(
  choreId: string,
  householdId: string,
  assignedTo: string | null,
  title: string,
  nextDueDate: string | null,
) {
  if (!nextDueDate) {
    await cancelScheduledNotifications("chore", choreId);
    return;
  }
  await upsertScheduledNotification({
    householdId,
    userId: assignedTo,
    category: "tareas",
    entityType: "chore",
    entityId: choreId,
    scheduledFor: instantFromLocalDateTime(nextDueDate, "09:00"),
    title: "Tarea de casa",
    body: title,
  });
}

// Month-end anchor for mensual rules (see lib/recurrence.ts).
function anchorDayFor(frequency: string, nextDueDate?: string): number | null {
  if (!nextDueDate || frequency !== "mensual") return null;
  return parseInt(nextDueDate.slice(8, 10), 10);
}

export async function createChore(
  _prevState: ChoreFormState,
  formData: FormData,
): Promise<ChoreFormState> {
  const parsed = choreSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    assignedTo: formData.get("assignedTo") || undefined,
    frequency: formData.get("frequency") || "puntual",
    nextDueDate: formData.get("nextDueDate") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chores")
    .insert({
      household_id: householdId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      assigned_to: parsed.data.assignedTo || null,
      frequency: parsed.data.frequency,
      next_due_date: parsed.data.nextDueDate || null,
      anchor_day: anchorDayFor(parsed.data.frequency, parsed.data.nextDueDate),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "No se ha podido guardar. Inténtalo de nuevo." };
  }

  await scheduleChoreNotification(
    data.id,
    householdId,
    parsed.data.assignedTo || null,
    parsed.data.title,
    parsed.data.nextDueDate || null,
  );
  void logActivity({ householdId, actorId: user.id, entityType: "chore", entityId: data.id, action: "created", summary: `Añadió la tarea: ${parsed.data.title}` });

  revalidatePath("/tareas");
  return { success: true };
}

export async function updateChore(
  choreId: string,
  _prevState: ChoreFormState,
  formData: FormData,
): Promise<ChoreFormState> {
  const parsed = choreSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    assignedTo: formData.get("assignedTo") || undefined,
    frequency: formData.get("frequency") || "puntual",
    nextDueDate: formData.get("nextDueDate") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase
    .from("chores")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      assigned_to: parsed.data.assignedTo || null,
      frequency: parsed.data.frequency,
      next_due_date: parsed.data.nextDueDate || null,
      anchor_day: anchorDayFor(parsed.data.frequency, parsed.data.nextDueDate),
    })
    .eq("id", choreId)
    .eq("household_id", householdId);

  if (error) {
    return { error: "No se ha podido guardar. Inténtalo de nuevo." };
  }

  await scheduleChoreNotification(
    choreId,
    householdId,
    parsed.data.assignedTo || null,
    parsed.data.title,
    parsed.data.nextDueDate || null,
  );

  revalidatePath("/tareas");
  return { success: true };
}

export async function completeChore(choreId: string) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: chore } = await supabase
    .from("chores")
    .select("title, frequency, next_due_date, assigned_to, anchor_day")
    .eq("id", choreId)
    .eq("household_id", householdId)
    .single();

  if (!chore) return;

  await cancelScheduledNotifications("chore", choreId);

  // Record the completed occurrence. Idempotent: the unique occurrence key
  // means a concurrent duplicate completion refreshes actor/time instead of
  // duplicating history.
  await supabase.from("chore_completions").upsert(
    {
      chore_id: choreId,
      household_id: householdId,
      occurrence_key: chore.next_due_date ?? "once",
      completed_at: new Date().toISOString(),
      completed_by: user.id,
    },
    { onConflict: "chore_id,occurrence_key" },
  );

  if (chore.frequency === "puntual" || !chore.next_due_date) {
    await supabase.from("chores").update({ status: "hecho" }).eq("id", choreId).eq("household_id", householdId);
    void logActivity({ householdId, actorId: user.id, entityType: "chore", entityId: choreId, action: "completed", summary: `Completó la tarea: ${chore.title}` });
    revalidatePath("/tareas");
    return;
  }

  const nextDate = advanceDateOnly(
    chore.next_due_date,
    chore.frequency as RecurrenceFrequency,
    chore.anchor_day,
  );

  // Guarded advance: only from the occurrence we just completed, so a
  // concurrent duplicate completion creates at most one next occurrence.
  const { data: advanced } = await supabase
    .from("chores")
    .update({ status: "pendiente", next_due_date: nextDate })
    .eq("id", choreId)
    .eq("household_id", householdId)
    .eq("next_due_date", chore.next_due_date)
    .select("id");

  if (advanced?.length) {
    await scheduleChoreNotification(choreId, householdId, chore.assigned_to, chore.title, nextDate);
  }
  void logActivity({ householdId, actorId: user.id, entityType: "chore", entityId: choreId, action: "completed", summary: `Completó la tarea: ${chore.title}` });

  revalidatePath("/tareas");
}

export async function snoozeChore(choreId: string, days: number) {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: chore } = await supabase
    .from("chores")
    .select("title, next_due_date, assigned_to")
    .eq("id", choreId)
    .single();

  if (!chore) return;

  const base = chore.next_due_date ? new Date(`${chore.next_due_date}T00:00:00`) : new Date();
  base.setDate(base.getDate() + days);
  const newDueDate = base.toISOString().slice(0, 10);

  await supabase
    .from("chores")
    .update({ next_due_date: newDueDate, status: "pendiente" })
    .eq("id", choreId)
    .eq("household_id", householdId);

  await scheduleChoreNotification(choreId, householdId, chore.assigned_to, chore.title, newDueDate);

  revalidatePath("/tareas");
}

export async function deleteChore(choreId: string) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: chore } = await supabase.from("chores").select("title").eq("id", choreId).single();
  await supabase.from("chores").delete().eq("id", choreId).eq("household_id", householdId);
  await cancelScheduledNotifications("chore", choreId);
  void logActivity({ householdId, actorId: user.id, entityType: "chore", entityId: choreId, action: "deleted", summary: `Eliminó la tarea: ${chore?.title ?? choreId}` });

  revalidatePath("/tareas");
}

function flattenFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
