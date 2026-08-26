// Pure quiet-hours helpers — no Deno/runtime APIs so the same module is unit
// tested with vitest (tests/quiet-hours.test.ts) and imported by the worker.

/** "HH:MM" wall-clock for an instant in a timezone. */
export function localHHMM(now: Date, timeZone: string): string {
  return now
    .toLocaleTimeString("en-US", {
      timeZone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    })
    .slice(0, 5);
}

/**
 * Whether `now` falls inside the quiet window [start, end) expressed as
 * "HH:MM(:SS)" wall-clock times in `timeZone`. Overnight windows
 * (e.g. 23:00 → 08:00) are supported.
 */
export function isInQuietHours(
  now: Date,
  start: string | null,
  end: string | null,
  timeZone: string,
): boolean {
  if (!start || !end) return false;
  const hhmm = localHHMM(now, timeZone);
  const s = start.slice(0, 5);
  const e = end.slice(0, 5);
  return s <= e ? hhmm >= s && hhmm < e : hhmm >= s || hhmm < e;
}

/**
 * Seconds from `now` until the next occurrence of the quiet-hours end
 * ("HH:MM(:SS)" wall-clock in `timeZone`). Never returns less than 60 so a
 * deferral always lands strictly in the future.
 */
export function secondsUntilQuietEnd(
  now: Date,
  end: string,
  timeZone: string,
): number {
  const [ch, cm] = localHHMM(now, timeZone).split(":").map(Number);
  const [eh, em] = end.slice(0, 5).split(":").map(Number);
  const deltaMinutes = (eh * 60 + em - (ch * 60 + cm) + 24 * 60) % (24 * 60);
  return Math.max(deltaMinutes * 60, 60);
}
