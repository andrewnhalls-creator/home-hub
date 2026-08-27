"use client";

import { useState } from "react";
import { MONTH_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MonthPickerProps {
  /** Form field name; submitted once per selected month (formData.getAll). */
  name: string;
  label: string;
  defaultValue?: number[] | null;
}

/** Chip-style multi-select of months for non-monthly recurrences. */
export function MonthPicker({ name, label, defaultValue }: MonthPickerProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set(defaultValue ?? []));

  function toggle(month: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(month)) next.delete(month);
      else next.add(month);
      return next;
    });
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-brown">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {MONTH_OPTIONS.map((m) => (
          <button
            key={m.value}
            type="button"
            aria-pressed={selected.has(m.value)}
            onClick={() => toggle(m.value)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium transition",
              selected.has(m.value)
                ? "border-terracotta bg-terracotta text-cream"
                : "border-sand bg-transparent text-muted hover:bg-sand",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      {[...selected].map((m) => (
        <input key={m} type="hidden" name={name} value={m} />
      ))}
    </div>
  );
}
