"use client";

import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface Cell {
  date: string;
  done: boolean;
}

interface CompletionHeatmapProps {
  grid: Cell[]; // 84 cells: 12 weeks × 7 days, Mon-first
}

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export function CompletionHeatmap({ grid }: CompletionHeatmapProps) {
  // Build week columns: 12 weeks, each with 7 days
  const weeks: Cell[][] = [];
  for (let w = 0; w < 12; w++) {
    weeks.push(grid.slice(w * 7, w * 7 + 7));
  }

  return (
    <div className="flex gap-1.5">
      {/* Day labels */}
      <div className="flex flex-col justify-between py-0.5">
        {DAY_LABELS.map((d) => (
          <span key={d} className="flex h-4 items-center text-[12px] leading-none text-muted">
            {d}
          </span>
        ))}
      </div>

      {/* Week columns */}
      <div className="flex flex-1 gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-1 flex-col gap-1">
            {week.map((cell) => (
              <div
                key={cell.date}
                title={format(parseISO(cell.date), "d 'de' MMMM", { locale: es })}
                className={cn(
                  "h-4 w-full rounded-sm",
                  cell.done ? "bg-terracotta/60" : "bg-sand",
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
