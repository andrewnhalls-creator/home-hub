"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { calendarEventSchema } from "@/lib/validations/calendar";
import { upsertScheduledNotification, cancelScheduledNotifications } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";
import {
  instantFromLocalDateTime,
  nextOccurrenceOnOrAfter,
  type RecurrenceFrequency,
} from "@/lib/recurrence";

export interface CalendarEventFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

/**
 * Arms the reminder for the next relevant occurrence (Madrid wall clock).
 * One-off events remind at their date; recurring events remind at the next
 * occurrence on/after today that is not skipped by an exception. The worker
 * re-arms the following occurrence after each delivery (see outbox-worker).
 */
async function scheduleEventReminder(
  eventId: string,
  householdId: string,
  title: string,
  eventDate: string,
  eventTime: string | undefined,
  remindBeforeMinutes: number | "" | undefined,
  repeatFrequency: string,
) {
  if (remindBeforeMinutes === undefined || remindBeforeMinutes === "") {
    await cancelScheduledNotifications("calendar_event", eventId);
    return;
  }

  let occurrenceDate = eventDate;
  if (repeatFrequency !== "ninguna") {
    const supabase = await createClient();
    const { data: exceptions } = await supabase
      .from("calendar_event_exceptions")
      .select("occurrence_date")
      .eq("event_id", eventId);
    const skipped = new Set((exceptions ?? []).map((e) => e.occurrence_date as string));
    const today = new Date().toISOString().slice(0, 10);
    const next = nextOccurrenceOnOrAfter(
      eventDate,
      repeatFrequency as RecurrenceFrequency,
      today,
      skipped,
    );
    if (!next) {
      await cancelScheduledNotifications("calendar_event", eventId);
      return;
    }
    occurrenceDate = next;
  }

  const eventInstant = instantFromLocalDateTime(occurrenceDate, eventTime || "09:00");
  const scheduledFor = new Date(
    new Date(eventInstant).getTime() - Number(remindBeforeMinutes) * 60 * 1000,
  ).toISOString();

  await upsertScheduledNotification({
    householdId,
    userId: null,
    category: "calendario",
    entityType: "calendar_event",
    entityId: eventId,
    scheduledFor,
    title: "Evento en el calendario",
    body: title,
  });
}

export async function createCalendarEvent(
  _prevState: CalendarEventFormState,
  formData: FormData,
): Promise<CalendarEventFormState> {
  const parsed = calendarEventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    eventDate: formData.get("eventDate"),
    endDate: formData.get("endDate") || undefined,
    eventTime: formData.get("eventTime") || undefined,
    isAllDay: formData.get("isAllDay") === "on",
    repeatFrequency: formData.get("repeatFrequency") || "ninguna",
    remindBeforeMinutes: formData.get("remindBeforeMinutes") || undefined,
    isPrivate: formData.get("isPrivate") === "on",
    color: formData.get("color") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      household_id: householdId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      event_date: parsed.data.eventDate,
      end_date: parsed.data.repeatFrequency === "ninguna" ? (parsed.data.endDate || null) : null,
      event_time: parsed.data.isAllDay ? null : parsed.data.eventTime || null,
      is_all_day: parsed.data.isAllDay,
      repeat_frequency: parsed.data.repeatFrequency,
      remind_before_minutes:
        parsed.data.remindBeforeMinutes === "" ? null : parsed.data.remindBeforeMinutes,
      is_private: parsed.data.isPrivate,
      color: parsed.data.color || null,
      notes: parsed.data.notes || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "No se ha podido guardar. Inténtalo de nuevo." };
  }

  await scheduleEventReminder(
    data.id,
    householdId,
    parsed.data.title,
    parsed.data.eventDate,
    parsed.data.eventTime,
    parsed.data.remindBeforeMinutes,
    parsed.data.repeatFrequency,
  );
  void logActivity({ householdId, actorId: user.id, entityType: "calendar_event", entityId: data.id, action: "created", summary: `Añadió el evento: ${parsed.data.title}` });

  revalidatePath("/calendario");
  return { success: true };
}

export async function updateCalendarEvent(
  eventId: string,
  _prevState: CalendarEventFormState,
  formData: FormData,
): Promise<CalendarEventFormState> {
  const parsed = calendarEventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    eventDate: formData.get("eventDate"),
    endDate: formData.get("endDate") || undefined,
    eventTime: formData.get("eventTime") || undefined,
    isAllDay: formData.get("isAllDay") === "on",
    repeatFrequency: formData.get("repeatFrequency") || "ninguna",
    remindBeforeMinutes: formData.get("remindBeforeMinutes") || undefined,
    isPrivate: formData.get("isPrivate") === "on",
    color: formData.get("color") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase
    .from("calendar_events")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      event_date: parsed.data.eventDate,
      end_date: parsed.data.repeatFrequency === "ninguna" ? (parsed.data.endDate || null) : null,
      event_time: parsed.data.isAllDay ? null : parsed.data.eventTime || null,
      is_all_day: parsed.data.isAllDay,
      repeat_frequency: parsed.data.repeatFrequency,
      remind_before_minutes:
        parsed.data.remindBeforeMinutes === "" ? null : parsed.data.remindBeforeMinutes,
      is_private: parsed.data.isPrivate,
      color: parsed.data.color || null,
      notes: parsed.data.notes || null,
    })
    .eq("id", eventId)
    .eq("household_id", householdId);

  if (error) {
    return { error: "No se ha podido guardar. Inténtalo de nuevo." };
  }

  await scheduleEventReminder(
    eventId,
    householdId,
    parsed.data.title,
    parsed.data.eventDate,
    parsed.data.eventTime,
    parsed.data.remindBeforeMinutes,
    parsed.data.repeatFrequency,
  );

  revalidatePath("/calendario");
  return { success: true };
}

/**
 * "Eliminar solo este día": records an exception for one occurrence of a
 * recurring event without touching the series, and re-arms the reminder in
 * case the skipped occurrence was the one scheduled next.
 */
export async function skipCalendarEventOccurrence(eventId: string, occurrenceDate: string) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("calendar_events")
    .select("title, event_date, event_time, repeat_frequency, remind_before_minutes")
    .eq("id", eventId)
    .eq("household_id", householdId)
    .single();

  if (!event || event.repeat_frequency === "ninguna") return;

  await supabase.from("calendar_event_exceptions").upsert(
    {
      event_id: eventId,
      household_id: householdId,
      occurrence_date: occurrenceDate,
      created_by: user.id,
    },
    { onConflict: "event_id,occurrence_date", ignoreDuplicates: true },
  );

  await scheduleEventReminder(
    eventId,
    householdId,
    event.title,
    event.event_date,
    event.event_time?.slice(0, 5) ?? undefined,
    event.remind_before_minutes ?? undefined,
    event.repeat_frequency,
  );

  void logActivity({ householdId, actorId: user.id, entityType: "calendar_event", entityId: eventId, action: "occurrence_skipped", summary: `Quitó un día del evento: ${event.title}` });

  revalidatePath("/calendario");
}

export async function deleteCalendarEvent(eventId: string) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: event } = await supabase.from("calendar_events").select("title").eq("id", eventId).single();

  await supabase
    .from("calendar_events")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
    .eq("id", eventId)
    .eq("household_id", householdId);

  await cancelScheduledNotifications("calendar_event", eventId);
  void logActivity({ householdId, actorId: user.id, entityType: "calendar_event", entityId: eventId, action: "deleted", summary: `Eliminó el evento: ${event?.title ?? eventId}` });

  revalidatePath("/calendario");
}

export async function restoreCalendarEvent(
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const eventId = formData.get("id") as string;
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase
    .from("calendar_events")
    .update({ deleted_at: null, deleted_by: null })
    .eq("id", eventId)
    .eq("household_id", householdId);

  if (error) return { error: "No se ha podido restaurar." };

  revalidatePath("/calendario");
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
