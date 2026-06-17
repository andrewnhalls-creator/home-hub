import { cn } from "@/lib/utils";

interface GreetingCardProps {
  firstName?: string;
  householdName: string;
  pendingCount: number;
}

export function GreetingCard({ firstName, householdName, pendingCount }: GreetingCardProps) {
  const greeting = firstName ? `Hola, ${firstName}` : "Hola";

  const statusLine =
    pendingCount === 0
      ? "Todo en orden por hoy."
      : pendingCount === 1
        ? "Tienes 1 cosa pendiente."
        : `Tienes ${pendingCount} cosas pendientes.`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-terracotta/20 bg-card backdrop-blur-xl p-5 shadow-[var(--shadow-card)]">
      {/* Decorative circles */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-terracotta/10" aria-hidden />
      <div className="absolute -right-2 -top-2 h-12 w-12 rounded-full bg-terracotta/12" aria-hidden />

      <div className="relative flex flex-col gap-0.5">
        <p className="text-2xl font-bold text-brown">{greeting}</p>
        <p className="text-sm text-muted">{householdName}</p>
        <div className="mt-3 flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              pendingCount === 0 ? "bg-success" : "bg-amber",
            )}
            aria-hidden
          />
          <p
            className={cn(
              "text-sm font-medium",
              pendingCount === 0 ? "text-success" : "text-brown",
            )}
          >
            {statusLine}
          </p>
        </div>
      </div>
    </div>
  );
}
