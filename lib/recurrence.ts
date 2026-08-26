// The single recurrence engine (backend slice B2.1).
// Used by reminders and chores now; calendar events, fixed payments, income
// and subscriptions adopt it in later slices. Documented subset:
// - Frequencies: diaria, semanal, quincenal, mensual, anual (no end date/count;
//   a series ends when its template is edited or deleted).
// - Month-end rule: a monthly/annual rule anchored on day 29/30/31 falls on the
//   last valid day of shorter months and returns to the anchor day when valid
//   (e.g. 31 ene → 28 feb → 31 mar). The anchor day is stored on the template.
// - Timezone rule: instants preserve Europe/Madrid WALL-CLOCK time across DST
//   (a daily 09:00 reminder stays at 09:00 after the March/October changes).
// - Occurrence keys: the occurrence's due date (chores) or due instant
//   (reminders) — unique per template, making completion idempotent.

export type RecurrenceFrequency =
  | "diaria"
  | "semanal"
  | "quincenal"
  | "mensual"
  | "anual";

export const DEFAULT_TIMEZONE = "Europe/Madrid";

export interface WallClock {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
}

/** Wall-clock parts of an instant in a timezone. */
export function wallClockInTimeZone(instant: Date, timeZone: string): WallClock {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(instant);
  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10);
  // Intl reports midnight as hour 24 in some environments; normalize.
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour") % 24,
    minute: get("minute"),
  };
}

/**
 * The UTC instant whose wall clock in `timeZone` matches `wall`.
 * Two-pass offset resolution so instants around DST transitions land on the
 * correct side; a nonexistent wall time (spring-forward gap) resolves to the
 * instant shifted by the transition.
 */
export function instantFromWallClock(wall: WallClock, timeZone: string): Date {
  const asUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute);
  const resolve = (guess: number): number => {
    const shown = wallClockInTimeZone(new Date(guess), timeZone);
    const shownAsUtc = Date.UTC(shown.year, shown.month - 1, shown.day, shown.hour, shown.minute);
    return guess + (asUtc - shownAsUtc);
  };
  return new Date(resolve(resolve(asUtc)));
}

export function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

interface DateParts {
  year: number;
  month: number; // 1-12
  day: number;
}

/** Pure date-part advancement with the month-end anchor rule. */
export function advanceDateParts(
  parts: DateParts,
  frequency: RecurrenceFrequency,
  anchorDay?: number | null,
): DateParts {
  const addDays = (n: number): DateParts => {
    const d = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + n));
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
  };

  switch (frequency) {
    case "diaria":
      return addDays(1);
    case "semanal":
      return addDays(7);
    case "quincenal":
      return addDays(14);
    case "mensual": {
      const month = parts.month === 12 ? 1 : parts.month + 1;
      const year = parts.month === 12 ? parts.year + 1 : parts.year;
      const target = anchorDay ?? parts.day;
      return { year, month, day: Math.min(target, lastDayOfMonth(year, month)) };
    }
    case "anual": {
      const year = parts.year + 1;
      const target = anchorDay ?? parts.day;
      return { year, month: parts.month, day: Math.min(target, lastDayOfMonth(year, parts.month)) };
    }
  }
}

/** Next occurrence for a DATE-based rule (chores.next_due_date). */
export function advanceDateOnly(
  isoDate: string,
  frequency: RecurrenceFrequency,
  anchorDay?: number | null,
): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const next = advanceDateParts({ year, month, day }, frequency, anchorDay);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${next.year}-${pad(next.month)}-${pad(next.day)}`;
}

/**
 * Next occurrence for an INSTANT-based rule (reminders.due_at), preserving the
 * rule timezone's wall-clock time across DST transitions.
 */
export function advanceInstant(
  iso: string,
  frequency: RecurrenceFrequency,
  anchorDay?: number | null,
  timeZone: string = DEFAULT_TIMEZONE,
): string {
  const wall = wallClockInTimeZone(new Date(iso), timeZone);
  const next = advanceDateParts(
    { year: wall.year, month: wall.month, day: wall.day },
    frequency,
    anchorDay,
  );
  return instantFromWallClock(
    { ...next, hour: wall.hour, minute: wall.minute },
    timeZone,
  ).toISOString();
}

/** Day-of-month of an instant in the rule timezone (for storing anchors). */
export function dayOfMonthInTimeZone(
  iso: string,
  timeZone: string = DEFAULT_TIMEZONE,
): number {
  return wallClockInTimeZone(new Date(iso), timeZone).day;
}

/**
 * The UTC instant for a local date + "HH:MM" in the rule timezone.
 * (Shared by the reminder form handling and the engine.)
 */
export function instantFromLocalDateTime(
  isoDate: string,
  time: string,
  timeZone: string = DEFAULT_TIMEZONE,
): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return instantFromWallClock({ year, month, day, hour, minute }, timeZone).toISOString();
}
