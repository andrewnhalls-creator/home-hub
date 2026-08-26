import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
} from "@/lib/format";

// es-ES currency output uses NBSP/NNBSP before €; normalize for stable asserts.
function normalize(s: string): string {
  return s.replace(/ | /g, " ");
}

describe("formatCurrency", () => {
  it("formats euros in es-ES", () => {
    expect(normalize(formatCurrency(1234.5))).toBe("1234,50 €");
  });

  it("keeps two decimals for whole amounts", () => {
    expect(normalize(formatCurrency(80))).toBe("80,00 €");
  });

  it("handles negative amounts", () => {
    expect(normalize(formatCurrency(-12.3))).toBe("-12,30 €");
  });
});

describe("date formatting (es-ES, dd/MM/yyyy, 24h)", () => {
  const date = new Date(2026, 7, 26, 9, 5); // 26 Aug 2026 09:05 local

  it("formatDate uses dd/MM/yyyy", () => {
    expect(formatDate(date)).toBe("26/08/2026");
  });

  it("formatDateTime appends HH:mm", () => {
    expect(formatDateTime(date)).toBe("26/08/2026 09:05");
  });

  it("formatTime is 24-hour", () => {
    expect(formatTime(new Date(2026, 7, 26, 17, 30))).toBe("17:30");
  });

  it("accepts ISO strings", () => {
    expect(formatDate("2026-01-05T10:00:00")).toBe("05/01/2026");
  });
});
