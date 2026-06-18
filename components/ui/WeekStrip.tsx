"use client";

import { startOfWeek, addDays, isSameDay, isToday, format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

interface WeekStripProps {
  /** First day of the week to display. Defaults to Monday of the current week. */
  weekStart?: Date;
  /** Currently selected date (highlighted with ring). */
  selectedDate?: Date;
  /** Called when the user taps a day. */
  onDateSelect?: (date: Date) => void;
  /** Dates that should show an event dot below the number. */
  eventDates?: Date[];
  className?: string;
}

export function WeekStrip({
  weekStart,
  selectedDate,
  onDateSelect,
  eventDates = [],
  className,
}: WeekStripProps) {
  const monday =
    weekStart ??
    startOfWeek(new Date(), { weekStartsOn: 1 });

  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));

  return (
    <div className={cn("flex items-center justify-between gap-1", className)}>
      {days.map((day, i) => {
        const today = isToday(day);
        const selected = selectedDate ? isSameDay(day, selectedDate) : false;
        const hasEvent = eventDates.some((d) => isSameDay(d, day));
        const isWeekend = i >= 5;

        return (
          <button
            key={day.toISOString()}
            type="button"
            aria-label={format(day, "EEEE d 'de' MMMM", { locale: es })}
            aria-pressed={selected}
            onClick={() => onDateSelect?.(day)}
            tabIndex={onDateSelect ? 0 : -1}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-colors",
              onDateSelect ? "cursor-pointer hover:bg-sand" : "cursor-default",
              selected && "bg-terracotta/10",
            )}
          >
            <span
              className={cn(
                "text-xs font-medium uppercase tracking-wide",
                isWeekend ? "text-coral" : "text-muted",
                selected && "text-terracotta",
              )}
            >
              {DAY_LABELS[i]}
            </span>
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                today && !selected && "bg-terracotta text-white",
                selected && "bg-terracotta text-white",
                !today && !selected && "text-brown",
              )}
            >
              {format(day, "d")}
            </span>
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                hasEvent ? "bg-terracotta/60" : "bg-transparent",
              )}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}
