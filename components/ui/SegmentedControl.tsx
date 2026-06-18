"use client";

import { useLayoutEffect, useRef, useState } from "react";
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

interface IndicatorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  scrollable = false,
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = options.findIndex((o) => o.value === value);
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null);

  // useLayoutEffect runs before paint — no flash on first render
  useLayoutEffect(() => {
    const btn = buttonRefs.current[activeIndex];
    if (!btn) return;
    setIndicator({
      top: btn.offsetTop,
      left: btn.offsetLeft,
      width: btn.offsetWidth,
      height: btn.offsetHeight,
    });
  }, [activeIndex, options.length]);

  const indicatorEl = indicator ? (
    <div
      aria-hidden
      className="absolute rounded-lg bg-white/[0.14] shadow-sm transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
      style={{
        top: indicator.top,
        left: indicator.left,
        width: indicator.width,
        height: indicator.height,
      }}
    />
  ) : null;

  const buttons = options.map((option, i) => {
    const active = option.value === value;
    return (
      <button
        key={option.value}
        ref={(el) => {
          buttonRefs.current[i] = el;
        }}
        role="tab"
        type="button"
        aria-selected={active}
        onClick={() => onChange(option.value)}
        className={cn(
          "relative z-10 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta active:scale-[0.95]",
          scrollable ? "shrink-0" : "flex-1",
          active ? "text-terracotta" : "text-muted hover:text-brown",
        )}
      >
        {option.label}
      </button>
    );
  });

  if (scrollable) {
    return (
      <div className={cn("scrollbar-none overflow-x-auto rounded-xl bg-sand p-1", className)}>
        <div role="tablist" aria-label={ariaLabel} className="relative flex gap-1">
          {indicatorEl}
          {buttons}
        </div>
      </div>
    );
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("relative flex gap-1 rounded-xl bg-sand p-1", className)}
    >
      {indicatorEl}
      {buttons}
    </div>
  );
}
