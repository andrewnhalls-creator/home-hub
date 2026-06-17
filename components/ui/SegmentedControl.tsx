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
  /** When true, items don't stretch to fill — the strip scrolls horizontally. */
  scrollable?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  scrollable = false,
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  const buttons = options.map((option) => {
    const active = option.value === value;
    return (
      <button
        key={option.value}
        role="tab"
        type="button"
        aria-selected={active}
        onClick={() => onChange(option.value)}
        className={cn(
          "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all",
          scrollable ? "shrink-0" : "flex-1",
          active
            ? "bg-card text-terracotta shadow-[var(--shadow-card)]"
            : "text-muted hover:text-brown",
        )}
      >
        {option.label}
      </button>
    );
  });

  if (scrollable) {
    return (
      <div className={cn("scrollbar-none overflow-x-auto rounded-xl bg-sand p-1", className)}>
        <div role="tablist" aria-label={ariaLabel} className="flex gap-1">
          {buttons}
        </div>
      </div>
    );
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("flex gap-1 rounded-xl bg-sand p-1", className)}
    >
      {buttons}
    </div>
  );
}
