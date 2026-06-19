import { Sk } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-label="Cargando">
      {/* Greeting card */}
      <div className="rounded-2xl border border-white/[0.06] bg-card p-5 shadow-[var(--shadow-card)]">
        <Sk className="h-7 w-2/5 rounded-full" />
        <Sk className="mt-2 h-4 w-1/3 rounded-full" />
        <Sk className="mt-4 h-4 w-1/2 rounded-full" />
      </div>

      {/* Quick items card */}
      <div className="rounded-2xl border border-white/[0.06] bg-card p-4 shadow-[var(--shadow-card)]">
        <Sk className="mb-4 h-4 w-1/4 rounded-full" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <Sk className="h-4 w-4 shrink-0 rounded-full" />
            <Sk className="h-3.5 flex-1 rounded-full" />
            <Sk className="h-3.5 w-14 shrink-0 rounded-full" />
          </div>
        ))}
      </div>

      {/* Metric cards 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-white/[0.06] bg-card p-4 shadow-[var(--shadow-card)]">
            <Sk className="h-6 w-3/4 rounded-full" />
            <Sk className="mt-2 h-3 w-1/2 rounded-full" />
          </div>
        ))}
      </div>

      {/* Calendar strip */}
      <div className="rounded-2xl border border-white/[0.06] bg-card p-4 shadow-[var(--shadow-card)]">
        <Sk className="mb-4 h-4 w-1/4 rounded-full" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Sk key={i} className="h-9 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
