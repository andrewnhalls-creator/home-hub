import { describe, expect, it } from "vitest";
import {
  isInQuietHours,
  localHHMM,
  secondsUntilQuietEnd,
} from "../supabase/functions/outbox-worker/quiet-hours";

const TZ = "Europe/Madrid";

describe("localHHMM", () => {
  it("converts UTC instants to Madrid wall clock (summer, UTC+2)", () => {
    expect(localHHMM(new Date("2026-08-26T21:30:00Z"), TZ)).toBe("23:30");
  });

  it("converts UTC instants to Madrid wall clock (winter, UTC+1)", () => {
    expect(localHHMM(new Date("2026-01-15T22:30:00Z"), TZ)).toBe("23:30");
  });
});

describe("isInQuietHours (overnight window 23:00 → 08:00)", () => {
  const start = "23:00";
  const end = "08:00";

  it("is quiet at 23:30 local", () => {
    expect(isInQuietHours(new Date("2026-08-26T21:30:00Z"), start, end, TZ)).toBe(true);
  });

  it("is quiet at 03:00 local", () => {
    expect(isInQuietHours(new Date("2026-08-26T01:00:00Z"), start, end, TZ)).toBe(true);
  });

  it("is not quiet at noon", () => {
    expect(isInQuietHours(new Date("2026-08-26T10:00:00Z"), start, end, TZ)).toBe(false);
  });

  it("end boundary is exclusive (08:00 is awake)", () => {
    expect(isInQuietHours(new Date("2026-08-26T06:00:00Z"), start, end, TZ)).toBe(false);
  });

  it("no window configured means never quiet", () => {
    expect(isInQuietHours(new Date("2026-08-26T21:30:00Z"), null, null, TZ)).toBe(false);
  });

  it("accepts HH:MM:SS strings from Postgres time columns", () => {
    expect(isInQuietHours(new Date("2026-08-26T21:30:00Z"), "23:00:00", "08:00:00", TZ)).toBe(true);
  });
});

describe("secondsUntilQuietEnd", () => {
  it("23:30 local → 08:00 end is 8.5 hours away", () => {
    expect(secondsUntilQuietEnd(new Date("2026-08-26T21:30:00Z"), "08:00", TZ)).toBe(8.5 * 3600);
  });

  it("07:59 local → one minute (the enforced minimum)", () => {
    expect(secondsUntilQuietEnd(new Date("2026-08-26T05:59:00Z"), "08:00", TZ)).toBe(60);
  });

  it("winter time is computed in CET", () => {
    // 22:30 UTC = 23:30 Madrid in January → 8.5h until 08:00
    expect(secondsUntilQuietEnd(new Date("2026-01-15T22:30:00Z"), "08:00", TZ)).toBe(8.5 * 3600);
  });
});
