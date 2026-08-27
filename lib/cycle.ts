// 25-to-25 budget cycle helpers.
// The household's month runs from the 25th of the previous calendar month
// to the 25th of the current calendar month (e.g. "June cycle" = 25 May – 25 Jun).
// The cycle is named after its END month: pay arrives on the 26th and funds the
// FOLLOWING month, so anything on day >= 25 of calendar month M belongs to the
// cycle named M+1.

export function getCycleDates(today: Date = new Date()): { start: Date; end: Date } {
  const day = today.getDate();
  if (day >= 25) {
    return {
      start: new Date(today.getFullYear(), today.getMonth(), 25),
      end:   new Date(today.getFullYear(), today.getMonth() + 1, 25),
    };
  }
  return {
    start: new Date(today.getFullYear(), today.getMonth() - 1, 25),
    end:   new Date(today.getFullYear(), today.getMonth(), 25),
  };
}

export function getCurrentCycleDates(): { start: Date; end: Date } {
  return getCycleDates(new Date());
}

export function getCycleLabel(locale = "es-ES"): string {
  const { start, end } = getCurrentCycleDates();
  const fmt = (d: Date) =>
    d.toLocaleDateString(locale, { day: "numeric", month: "short" });
  return `${fmt(start)} – ${fmt(end)}`;
}

// Returns the actual Date when a recurring payment (subscription or fixed) falls
// within the current 25-to-25 cycle. Days >= 25 fall in the cycle's START month,
// days < 25 in its END month — regardless of where "today" sits inside the cycle.
export function getCycleDueDate(dueDay: number, today: Date = new Date()): Date {
  const { start, end } = getCycleDates(today);
  return dueDay >= 25
    ? new Date(start.getFullYear(), start.getMonth(), dueDay)
    : new Date(end.getFullYear(), end.getMonth(), dueDay);
}

// Returns "pagado" | "pendiente" for any recurring item with a given billing/due day.
// Used for both subscriptions and fixed payments.
export function getSubscriptionCycleStatus(
  billingDay: number,
  today: Date = new Date()
): "pagado" | "pendiente" {
  const dueDate = getCycleDueDate(billingDay, today);
  return dueDate <= today ? "pagado" : "pendiente";
}

// Whether a recurring item (income source, fixed payment, subscription) has an
// occurrence inside the cycle named `cycleMonth` (1–12, the cycle's END month).
// Monthly/quincenal items occur every cycle. Non-monthly items occur only when
// one of their listed calendar months — shifted forward when the charge day is
// >= 25 — matches the cycle month. No listed months = timing unknown = never.
export function occursInCycle(
  frequency: string | null,
  recurrenceMonths: number[] | null,
  day: number | null,
  cycleMonth: number,
): boolean {
  if (!frequency || frequency === "mensual" || frequency === "quincenal") return true;
  const shift = (day ?? 1) >= 25 ? 1 : 0;
  return (recurrenceMonths ?? []).some((m) => ((m - 1 + shift) % 12) + 1 === cycleMonth);
}

export interface CycleIncomeSource {
  amount: number | string;
  frequency: string | null;
  payment_day: number | null;
  recurrence_months: number[] | null;
  is_active?: boolean;
}

// Income actually expected to arrive during the cycle named `cycleMonth` —
// full amounts, never averaged (no anual/12). Quincenal pays twice per cycle.
export function expectedIncomeInCycle(sources: CycleIncomeSource[], cycleMonth: number): number {
  return sources.reduce((sum, s) => {
    if (s.is_active === false) return sum;
    const amount = Number(s.amount);
    if (s.frequency === "quincenal") return sum + amount * 2;
    if (!occursInCycle(s.frequency, s.recurrence_months, s.payment_day, cycleMonth)) return sum;
    return sum + amount;
  }, 0);
}
