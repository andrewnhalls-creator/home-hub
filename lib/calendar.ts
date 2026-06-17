import { addDays, addMonths, addYears, format, isAfter, isBefore } from "date-fns";
import type { CalendarEvent } from "@/lib/types";

export interface CalendarOccurrence {
  date: string;
  event: CalendarEvent;
}

/**
 * Recurring calendar_events are not materialised into rows — expand on
 * read for the visible date range instead. See DATA_MODEL.md.
 */
export function expandCalendarEvent(
  event: CalendarEvent,
  rangeStart: Date,
  rangeEnd: Date,
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

  let cursor = new Date(`${event.event_date}T00:00:00`);

  const step = (date: Date) => {
    switch (event.repeat_frequency) {
      case "diaria":
        return addDays(date, 1);
      case "semanal":
        return addDays(date, 7);
      case "mensual":
        return addMonths(date, 1);
      case "anual":
        return addYears(date, 1);
      default:
        return date;
    }
  };

  // Fast-forward to the first occurrence at or after rangeStart.
  let guard = 0;
  while (isBefore(cursor, rangeStart) && guard < 1000) {
    cursor = step(cursor);
    guard += 1;
  }

  guard = 0;
  while (!isAfter(cursor, rangeEnd) && guard < 366) {
    occurrences.push({ date: format(cursor, "yyyy-MM-dd"), event });
    cursor = step(cursor);
    guard += 1;
  }

  return occurrences;
}

export function expandCalendarEvents(
  events: CalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date,
): CalendarOccurrence[] {
  return events.flatMap((event) => expandCalendarEvent(event, rangeStart, rangeEnd));
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
}: BuildCalendarItemsInput): CalendarItem[] {
  const items: CalendarItem[] = [];

  for (const occurrence of expandCalendarEvents(events, rangeStart, rangeEnd)) {
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
