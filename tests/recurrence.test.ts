import { describe, expect, it } from "vitest";
import {
  advanceDateOnly,
  advanceInstant,
  dayOfMonthInTimeZone,
  instantFromLocalDateTime,
  wallClockInTimeZone,
} from "@/lib/recurrence";

const TZ = "Europe/Madrid";

function madridClock(iso: string): string {
  const w = wallClockInTimeZone(new Date(iso), TZ);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${w.year}-${pad(w.month)}-${pad(w.day)} ${pad(w.hour)}:${pad(w.minute)}`;
}

describe("advanceDateOnly (chores)", () => {
  it("daily and weekly move by calendar days", () => {
    expect(advanceDateOnly("2026-08-26", "diaria")).toBe("2026-08-27");
    expect(advanceDateOnly("2026-08-26", "semanal")).toBe("2026-09-02");
    expect(advanceDateOnly("2026-08-26", "quincenal")).toBe("2026-09-09");
  });

  it("crosses month and year boundaries", () => {
    expect(advanceDateOnly("2026-12-31", "diaria")).toBe("2027-01-01");
    expect(advanceDateOnly("2026-12-29", "semanal")).toBe("2027-01-05");
  });

  it("monthly from Jan 31 clamps to Feb 28 (the old setMonth bug gave Mar 3)", () => {
    expect(advanceDateOnly("2026-01-31", "mensual", 31)).toBe("2026-02-28");
  });

  it("monthly recovers the anchor day after a short month", () => {
    expect(advanceDateOnly("2026-02-28", "mensual", 31)).toBe("2026-03-31");
    expect(advanceDateOnly("2026-04-30", "mensual", 31)).toBe("2026-05-31");
  });

  it("monthly without an anchor keeps the current day", () => {
    expect(advanceDateOnly("2026-08-15", "mensual")).toBe("2026-09-15");
  });

  it("leap year: 29 Feb 2028 annual → 28 Feb 2029, anchor 29 recovers in 2032", () => {
    expect(advanceDateOnly("2028-02-29", "anual", 29)).toBe("2029-02-28");
    expect(advanceDateOnly("2031-02-28", "anual", 29)).toBe("2032-02-29");
  });

  it("December monthly rolls into January", () => {
    expect(advanceDateOnly("2026-12-31", "mensual", 31)).toBe("2027-01-31");
  });
});

describe("advanceInstant (reminders) — Madrid wall-clock preservation", () => {
  it("daily reminder keeps 09:00 across the spring-forward (29 Mar 2026)", () => {
    // 28 Mar 2026 09:00 CET = 08:00Z; next day Madrid is CEST (UTC+2)
    const next = advanceInstant("2026-03-28T08:00:00.000Z", "diaria");
    expect(madridClock(next)).toBe("2026-03-29 09:00");
    expect(next).toBe("2026-03-29T07:00:00.000Z");
  });

  it("daily reminder keeps 09:00 across the fall-back (25 Oct 2026)", () => {
    // 24 Oct 2026 09:00 CEST = 07:00Z; next day Madrid is CET (UTC+1)
    const next = advanceInstant("2026-10-24T07:00:00.000Z", "diaria");
    expect(madridClock(next)).toBe("2026-10-25 09:00");
    expect(next).toBe("2026-10-25T08:00:00.000Z");
  });

  it("weekly across DST keeps wall-clock time", () => {
    const next = advanceInstant("2026-03-25T08:30:00.000Z", "semanal"); // Wed 09:30 CET
    expect(madridClock(next)).toBe("2026-04-01 09:30");
  });

  it("monthly instant clamps like dates do", () => {
    const next = advanceInstant("2026-01-31T08:00:00.000Z", "mensual", 31); // 31 Jan 09:00 CET
    expect(madridClock(next)).toBe("2026-02-28 09:00");
  });

  it("annual keeps month and wall-clock", () => {
    const next = advanceInstant("2026-08-26T07:00:00.000Z", "anual", 26); // 09:00 CEST
    expect(madridClock(next)).toBe("2027-08-26 09:00");
  });
});

describe("timezone helpers", () => {
  it("instantFromLocalDateTime converts Madrid local to UTC (summer/winter)", () => {
    expect(instantFromLocalDateTime("2026-08-26", "09:00")).toBe("2026-08-26T07:00:00.000Z");
    expect(instantFromLocalDateTime("2026-01-15", "09:00")).toBe("2026-01-15T08:00:00.000Z");
  });

  it("dayOfMonthInTimeZone uses the Madrid calendar day", () => {
    // 31 Jan 23:30 UTC is already 1 Feb 00:30 in Madrid
    expect(dayOfMonthInTimeZone("2026-01-31T23:30:00.000Z")).toBe(1);
  });
});
