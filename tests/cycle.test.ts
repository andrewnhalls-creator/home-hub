import { describe, expect, it } from "vitest";
import {
  expectedIncomeInCycle,
  getCycleDueDate,
  getSubscriptionCycleStatus,
  occursInCycle,
} from "@/lib/cycle";

// The household budget cycle runs 25th → 25th and is named after its END month:
// "September cycle" = 25 Aug – 25 Sep. Anything charged/received on day >= 25 of
// calendar month M therefore belongs to the cycle named M+1 (pay arrives on the
// 26th and funds the FOLLOWING month).

describe("occursInCycle", () => {
  it("monthly items count in every cycle", () => {
    expect(occursInCycle("mensual", null, 10, 9)).toBe(true);
    expect(occursInCycle(null, null, 10, 3)).toBe(true);
  });

  it("annual item due on a day < 25 counts only in its listed month's cycle", () => {
    // IBI paid 10 October → cycle "October" (25 Sep – 25 Oct)
    expect(occursInCycle("anual", [10], 10, 10)).toBe(true);
    expect(occursInCycle("anual", [10], 10, 11)).toBe(false);
    expect(occursInCycle("anual", [10], 10, 9)).toBe(false);
  });

  it("item due on day >= 25 shifts into the FOLLOWING month's cycle", () => {
    // Charged 26 August → falls inside 25 Aug – 25 Sep = "September" cycle
    expect(occursInCycle("anual", [8], 26, 9)).toBe(true);
    expect(occursInCycle("anual", [8], 26, 8)).toBe(false);
  });

  it("December + day >= 25 wraps into January's cycle", () => {
    expect(occursInCycle("anual", [12], 28, 1)).toBe(true);
    expect(occursInCycle("anual", [12], 28, 12)).toBe(false);
  });

  it("semestral lists two months and counts in both", () => {
    expect(occursInCycle("semestral", [1, 7], 10, 1)).toBe(true);
    expect(occursInCycle("semestral", [1, 7], 10, 7)).toBe(true);
    expect(occursInCycle("semestral", [1, 7], 10, 4)).toBe(false);
  });

  it("non-monthly with no listed months counts in no cycle (fecha pendiente)", () => {
    expect(occursInCycle("anual", null, 10, 6)).toBe(false);
    expect(occursInCycle("anual", [], 10, 6)).toBe(false);
  });

  it("unknown day is treated as before the 25th (no shift)", () => {
    expect(occursInCycle("anual", [5], null, 5)).toBe(true);
    expect(occursInCycle("anual", [5], null, 6)).toBe(false);
  });
});

describe("expectedIncomeInCycle", () => {
  const nomina = {
    amount: 2000,
    frequency: "mensual",
    payment_day: 26,
    recurrence_months: null,
    is_active: true,
  };
  const bonusAnual = {
    amount: 1200,
    frequency: "anual",
    payment_day: 10,
    recurrence_months: [6],
    is_active: true,
  };
  const trimestral = {
    amount: 300,
    frequency: "trimestral",
    payment_day: 5,
    recurrence_months: [1, 4, 7, 10],
    is_active: true,
  };

  it("only sums income that actually arrives in the cycle (no /12 averaging)", () => {
    // September cycle: only the nómina arrives
    expect(expectedIncomeInCycle([nomina, bonusAnual, trimestral], 9)).toBe(2000);
    // June cycle: nómina + annual bonus, full amount
    expect(expectedIncomeInCycle([nomina, bonusAnual, trimestral], 6)).toBe(3200);
    // July cycle: nómina + quarterly payment
    expect(expectedIncomeInCycle([nomina, bonusAnual, trimestral], 7)).toBe(2300);
  });

  it("ignores inactive sources", () => {
    expect(expectedIncomeInCycle([{ ...nomina, is_active: false }], 9)).toBe(0);
  });

  it("counts quincenal twice per cycle", () => {
    const quincenal = {
      amount: 500,
      frequency: "quincenal",
      payment_day: null,
      recurrence_months: null,
      is_active: true,
    };
    expect(expectedIncomeInCycle([quincenal], 4)).toBe(1000);
  });

  it("non-monthly income with no listed months contributes nothing", () => {
    const pendiente = {
      amount: 900,
      frequency: "anual",
      payment_day: null,
      recurrence_months: null,
      is_active: true,
    };
    expect(expectedIncomeInCycle([pendiente], 6)).toBe(0);
  });
});

describe("getCycleDueDate stays inside the current cycle", () => {
  it("day >= 25 maps to the cycle's START month when today is before the 25th", () => {
    const today = new Date(2026, 8, 10); // 10 Sep → cycle 25 Aug – 25 Sep
    const due = getCycleDueDate(26, today);
    expect(due.getFullYear()).toBe(2026);
    expect(due.getMonth()).toBe(7); // August
    expect(due.getDate()).toBe(26);
  });

  it("day >= 25 maps to the cycle's START month when today is on/after the 25th", () => {
    // 27 Aug → cycle 25 Aug – 25 Sep; a day-26 charge is due 26 Aug (NOT 26 Jul)
    const today = new Date(2026, 7, 27);
    const due = getCycleDueDate(26, today);
    expect(due.getFullYear()).toBe(2026);
    expect(due.getMonth()).toBe(7); // August
    expect(due.getDate()).toBe(26);
  });

  it("day < 25 maps to the cycle's END month when today is on/after the 25th", () => {
    // 27 Aug → cycle 25 Aug – 25 Sep; a day-10 charge is due 10 Sep
    const today = new Date(2026, 7, 27);
    const due = getCycleDueDate(10, today);
    expect(due.getMonth()).toBe(8); // September
    expect(due.getDate()).toBe(10);
  });

  it("status: a day-28 charge is pendiente on the 27th (same cycle, not yet charged)", () => {
    expect(getSubscriptionCycleStatus(28, new Date(2026, 7, 27))).toBe("pendiente");
  });

  it("status: a day-26 charge is pagado on the 27th", () => {
    expect(getSubscriptionCycleStatus(26, new Date(2026, 7, 27))).toBe("pagado");
  });
});
