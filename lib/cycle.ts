// 25-to-25 budget cycle helpers.
// The household's month runs from the 25th of the previous calendar month
// to the 25th of the current calendar month (e.g. "June cycle" = 25 May – 25 Jun).

export function getCurrentCycleDates(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDate();
  if (day >= 25) {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 25),
      end:   new Date(now.getFullYear(), now.getMonth() + 1, 25),
    };
  }
  return {
    start: new Date(now.getFullYear(), now.getMonth() - 1, 25),
    end:   new Date(now.getFullYear(), now.getMonth(), 25),
  };
}

export function getCycleLabel(locale = "es-ES"): string {
  const { start, end } = getCurrentCycleDates();
  const fmt = (d: Date) =>
    d.toLocaleDateString(locale, { day: "numeric", month: "short" });
  return `${fmt(start)} – ${fmt(end)}`;
}

// Returns the actual Date when a recurring payment (subscription or fixed) falls
// within the current 25-to-25 cycle. Days >= 25 fall in the PREVIOUS calendar month.
export function getCycleDueDate(dueDay: number, today: Date = new Date()): Date {
  const year  = today.getFullYear();
  const month = today.getMonth();
  return dueDay >= 25
    ? new Date(year, month - 1, dueDay)
    : new Date(year, month, dueDay);
}

// Returns "pagado" | "pendiente" for any recurring item with a given billing/due day.
// Days >= 25 are charged in the PREVIOUS calendar month (within this cycle).
// Used for both subscriptions and fixed payments.
export function getSubscriptionCycleStatus(
  billingDay: number,
  today: Date = new Date()
): "pagado" | "pendiente" {
  const dueDate = getCycleDueDate(billingDay, today);
  return dueDate <= today ? "pagado" : "pendiente";
}
