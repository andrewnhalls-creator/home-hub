import { addDays, format, isAfter, isBefore } from "date-fns";
import type { CalendarEvent } from "@/lib/types";
import { advanceDateOnly, type RecurrenceFrequency } from "@/lib/recurrence";

export interface CalendarOccurrence {
  date: string;
  event: CalendarEvent;
}

/** Set of "yyyy-MM-dd" dates excluded per event (from calendar_event_exceptions). */
export type EventExceptionMap = Map<string, Set<string>>;

/**
 * Recurring calendar_events are not materialised into rows — expand on
 * read for the visible date range instead, using the shared recurrence
 * engine (lib/recurrence.ts) so month-end rules match every other module:
 * a monthly event on day 31 falls on the last valid day of shorter months
 * and returns to 31 (date-fns addMonths lost the anchor). Occurrence dates
 * listed in `exceptions` ("eliminar solo este día") are skipped.
 */
export function expandCalendarEvent(
  event: CalendarEvent,
  rangeStart: Date,
  rangeEnd: Date,
  exceptions?: Set<string>,
): CalendarOccurrence[] {
  const occurrences: CalendarOccurrence[] = [];

  if (event.repeat_frequency === "ninguna") {
    const evStart = new Date(`${event.event_date}T00:00:00`);
    const evEnd = event.end_date ? new Date(`${event.end_date}T00:00:00`) : evStart;
    // Clamp iteration to visible range to avoid huge loops on long multi-day events
    const iterStart = isAfter(evStart, rangeStart) ? evStart : rangeStart;
    const iterEnd = isBefore(evEnd, rangeEnd) ? evEnd : rangeEnd;
    let cursor = iterStart;
    let guard = 0;
    while (!isAfter(cursor, iterEnd) && guard < 366) {
      occurrences.push({ date: format(cursor, "yyyy-MM-dd"), event });
      cursor = addDays(cursor, 1);
      guard++;
    }
    return occurrences;
  }

  const frequency = event.repeat_frequency as RecurrenceFrequency;
  const anchorDay = parseInt(event.event_date.slice(8, 10), 10);
  const startStr = format(rangeStart, "yyyy-MM-dd");
  const endStr = format(rangeEnd, "yyyy-MM-dd");

  let cursor = event.event_date;
  let guard = 0;
  while (cursor < startStr && guard < 1000) {
    cursor = advanceDateOnly(cursor, frequency, anchorDay);
    guard++;
  }

  guard = 0;
  while (cursor <= endStr && guard < 366) {
    if (!exceptions?.has(cursor)) {
      occurrences.push({ date: cursor, event });
    }
    cursor = advanceDateOnly(cursor, frequency, anchorDay);
    guard++;
  }

  return occurrences;
}

export function expandCalendarEvents(
  events: CalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date,
  exceptionsByEvent?: EventExceptionMap,
): CalendarOccurrence[] {
  return events.flatMap((event) =>
    expandCalendarEvent(event, rangeStart, rangeEnd, exceptionsByEvent?.get(event.id)),
  );
}

export type CalendarItemType =
  | "evento"
  | "recordatorio"
  | "tarea"
  | "pago"
  | "suscripcion"
  | "documento"
  | "comida";

export interface CalendarItem {
  id: string;
  date: string;
  title: string;
  type: CalendarItemType;
  isPrivate?: boolean;
  event?: CalendarEvent;
  color?: string;
  endDate?: string;
}

interface BuildCalendarItemsInput {
  events: CalendarEvent[];
  reminders: { id: string; title: string; due_at: string | null }[];
  chores: { id: string; title: string; next_due_date: string | null }[];
  paymentInstances: { id: string; due_date: string; fixed_payments: { name: string }[] | null }[];
  subscriptions: { id: string; name: string; renewal_date: string | null }[];
  documents: { id: string; title: string; expiry_date: string | null }[];
  meals: { id: string; planned_date: string; custom_name: string | null; recipes: { name: string }[] | null }[];
  rangeStart: Date;
  rangeEnd: Date;
  exceptionsByEvent?: EventExceptionMap;
}

export function buildCalendarItems({
  events,
  reminders,
  chores,
  paymentInstances,
  subscriptions,
  documents,
  meals,
  rangeStart,
  rangeEnd,
  exceptionsByEvent,
}: BuildCalendarItemsInput): CalendarItem[] {
  const items: CalendarItem[] = [];

  for (const occurrence of expandCalendarEvents(events, rangeStart, rangeEnd, exceptionsByEvent)) {
    items.push({
      id: `evento-${occurrence.event.id}-${occurrence.date}`,
      date: occurrence.date,
      title: occurrence.event.title,
      type: "evento",
      isPrivate: occurrence.event.is_private,
      event: occurrence.event,
      color: occurrence.event.color ?? undefined,
      endDate: occurrence.event.end_date ?? undefined,
    });
  }

  for (const reminder of reminders) {
    if (!reminder.due_at) continue;
    const date = reminder.due_at.slice(0, 10);
    items.push({ id: `recordatorio-${reminder.id}`, date, title: reminder.title, type: "recordatorio" });
  }

  for (const chore of chores) {
    if (!chore.next_due_date) continue;
    items.push({ id: `tarea-${chore.id}`, date: chore.next_due_date, title: chore.title, type: "tarea" });
  }

  for (const instance of paymentInstances) {
    items.push({
      id: `pago-${instance.id}`,
      date: instance.due_date,
      title: instance.fixed_payments?.[0]?.name ?? "Pago",
      type: "pago",
    });
  }

  for (const subscription of subscriptions) {
    if (!subscription.renewal_date) continue;
    items.push({
      id: `suscripcion-${subscription.id}`,
      date: subscription.renewal_date,
      title: subscription.name,
      type: "suscripcion",
    });
  }

  for (const document of documents) {
    if (!document.expiry_date) continue;
    items.push({
      id: `documento-${document.id}`,
      date: document.expiry_date,
      title: document.title,
      type: "documento",
    });
  }

  for (const meal of meals) {
    items.push({
      id: `comida-${meal.id}`,
      date: meal.planned_date,
      title: meal.recipes?.[0]?.name ?? meal.custom_name ?? "Comida",
      type: "comida",
    });
  }

  return items;
}
