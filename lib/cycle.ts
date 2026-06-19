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

// Returns "pagado" | "pendiente" for a monthly subscription with a given billing_day.
// Days >= 25 are charged in the PREVIOUS calendar month (within this cycle).
export function getSubscriptionCycleStatus(
  billingDay: number,
  today: Date = new Date()
): "pagado" | "pendiente" {
  const year  = today.getFullYear();
  const month = today.getMonth();
  const billingDate =
    billingDay >= 25
      ? new Date(year, month - 1, billingDay)
      : new Date(year, month, billingDay);
  return billingDate <= today ? "pagado" : "pendiente";
}
