import { Sk } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Cargando">
      {/* Month label */}
      <Sk className="h-4 w-1/3 rounded-full" />

      {/* Tab grid — 2 columns × 3 rows (mirrors 6-tab grid on mobile) */}
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-card px-3 py-3 shadow-[var(--shadow-card)]">
            <Sk className="h-4 w-4 shrink-0 rounded-md" />
            <Sk className="h-3.5 flex-1 rounded-full" />
          </div>
        ))}
      </div>

      {/* Content rows */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="flex flex-1 flex-col gap-2">
            <Sk className="h-4 w-1/2 rounded-full" />
            <Sk className="h-3 w-1/3 rounded-full" />
          </div>
          <Sk className="h-5 w-20 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}
