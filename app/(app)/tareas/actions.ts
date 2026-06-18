"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { choreSchema } from "@/lib/validations/chores";
import { upsertScheduledNotification, cancelScheduledNotifications } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";
import type { ChoreFrequency } from "@/lib/types";

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
    scheduledFor: new Date(`${nextDueDate}T09:00:00`).toISOString(),
    title: "Tarea de casa",
    body: title,
  });
}

function advanceDueDate(currentDate: string, frequency: ChoreFrequency): string {
  const date = new Date(`${currentDate}T00:00:00`);
  switch (frequency) {
    case "diaria":
      date.setDate(date.getDate() + 1);
      break;
    case "semanal":
      date.setDate(date.getDate() + 7);
      break;
    case "quincenal":
      date.setDate(date.getDate() + 14);
      break;
    case "mensual":
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      break;
  }
  return date.toISOString().slice(0, 10);
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
    .select("title, frequency, next_due_date, assigned_to")
    .eq("id", choreId)
    .single();

  if (!chore) return;

  await cancelScheduledNotifications("chore", choreId);

  // Record in completion history regardless of frequency
  void supabase.from("chore_completions").insert({
    chore_id: choreId,
    household_id: householdId,
    completed_by: user.id,
  });

  if (chore.frequency === "puntual" || !chore.next_due_date) {
    await supabase.from("chores").update({ status: "hecho" }).eq("id", choreId).eq("household_id", householdId);
    void logActivity({ householdId, actorId: user.id, entityType: "chore", entityId: choreId, action: "completed", summary: `Completó la tarea: ${chore.title}` });
    revalidatePath("/tareas");
    return;
  }

  const nextDate = advanceDueDate(chore.next_due_date, chore.frequency as ChoreFrequency);

  await supabase
    .from("chores")
    .update({ status: "pendiente", next_due_date: nextDate })
    .eq("id", choreId)
    .eq("household_id", householdId);

  await scheduleChoreNotification(choreId, householdId, chore.assigned_to, chore.title, nextDate);
  void logActivity({ householdId, actorId: user.id, entityType: "chore", entityId: choreId, action: "completed", summary: `Completó la tarea: ${chore.title}` });

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
