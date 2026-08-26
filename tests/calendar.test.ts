import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { expandCalendarEvent } from "@/lib/calendar";
import type { CalendarEvent } from "@/lib/types";

function event(overrides: Partial<CalendarEvent>): CalendarEvent {
  return {
    id: "e1",
    household_id: "h1",
    title: "Test",
    description: null,
    event_date: "2026-01-31",
    end_date: null,
    event_time: null,
    is_all_day: true,
    repeat_frequency: "ninguna",
    remind_before_minutes: null,
    is_private: false,
    color: null,
    notes: null,
    created_by: null,
    created_at: "",
    updated_at: "",
    deleted_at: null,
    deleted_by: null,
    ...overrides,
  } as CalendarEvent;
}

const range = (from: string, to: string): [Date, Date] => [
  new Date(`${from}T00:00:00`),
  new Date(`${to}T00:00:00`),
];

describe("expandCalendarEvent (shared engine)", () => {
  it("monthly on day 31 clamps to short months and recovers (the date-fns bug lost the anchor)", () => {
    const dates = expandCalendarEvent(
      event({ repeat_frequency: "mensual" }),
      ...range("2026-01-01", "2026-05-31"),
    ).map((o) => o.date);
    expect(dates).toEqual(["2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30", "2026-05-31"]);
  });

  it("skips occurrences listed as exceptions", () => {
    const dates = expandCalendarEvent(
      event({ event_date: "2026-08-03", repeat_frequency: "semanal" }),
      ...range("2026-08-01", "2026-08-31"),
      new Set(["2026-08-17"]),
    ).map((o) => o.date);
    expect(dates).toEqual(["2026-08-03", "2026-08-10", "2026-08-24", "2026-08-31"]);
  });

  it("annual events keep their date across years", () => {
    const dates = expandCalendarEvent(
      event({ event_date: "2026-06-15", repeat_frequency: "anual" }),
      ...range("2027-01-01", "2028-12-31"),
    ).map((o) => o.date);
    expect(dates).toEqual(["2027-06-15", "2028-06-15"]);
  });

  it("multi-day one-off events cover each day of their span", () => {
    const dates = expandCalendarEvent(
      event({ event_date: "2026-08-28", end_date: "2026-08-30" }),
      ...range("2026-08-01", "2026-08-31"),
    ).map((o) => o.date);
    expect(dates).toEqual(["2026-08-28", "2026-08-29", "2026-08-30"]);
  });
});

describe("outbox-worker engine copy", () => {
  it("supabase/functions/outbox-worker/recurrence.ts is identical to lib/recurrence.ts", () => {
    const lib = readFileSync("lib/recurrence.ts", "utf8");
    const worker = readFileSync("supabase/functions/outbox-worker/recurrence.ts", "utf8");
    expect(worker).toBe(lib);
  });
});
