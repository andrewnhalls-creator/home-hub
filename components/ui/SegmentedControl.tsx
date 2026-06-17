"use client";

import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  "aria-label"?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex gap-1 rounded-xl bg-sand p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              active
                ? "bg-card text-terracotta shadow-[var(--shadow-card)]"
                : "text-muted hover:text-brown",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
