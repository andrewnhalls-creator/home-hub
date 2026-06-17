export function PageLoader() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Cargando">
      <div className="h-10 w-1/2 animate-pulse rounded-xl bg-sand" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-sand" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3.5 w-3/4 animate-pulse rounded-full bg-sand" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-sand" />
          </div>
        </div>
      ))}
    </div>
  );
}
