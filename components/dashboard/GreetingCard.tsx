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
    <div className="rounded-2xl border border-terracotta/[0.25] bg-terracotta/[0.10] p-5">
      <div className="flex flex-col gap-0.5">
        <p className="font-display text-2xl font-bold text-brown tracking-tight">{greeting}</p>
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
