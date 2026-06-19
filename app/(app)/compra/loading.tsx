import { Sk } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Cargando">
      {/* Stat cards 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-white/[0.06] bg-card p-4 shadow-[var(--shadow-card)]">
            <Sk className="h-6 w-3/4 rounded-full" />
            <Sk className="mt-2 h-3 w-2/3 rounded-full" />
          </div>
        ))}
      </div>

      {/* List rows */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="flex flex-1 flex-col gap-2">
            <Sk className="h-4 w-2/3 rounded-full" />
            <Sk className="h-3 w-1/2 rounded-full" />
          </div>
          <Sk className="h-6 w-16 shrink-0 rounded-full" />
        </div>
      ))}

      {/* Nueva lista button */}
      <Sk className="mt-2 h-11 w-full rounded-xl" />
    </div>
  );
}
