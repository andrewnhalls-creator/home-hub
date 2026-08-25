import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AddNewButton } from "@/components/dashboard/AddNewButton";

interface GreetingCardProps {
  firstName?: string;
  householdName: string;
  pendingCount: number;
}

function madridHour(now: Date): number {
  return Number(
    new Intl.DateTimeFormat("es-ES", {
      hour: "numeric",
      hour12: false,
      timeZone: "Europe/Madrid",
    }).format(now),
  );
}

export function GreetingCard({ firstName, householdName, pendingCount }: GreetingCardProps) {
  const now = new Date();
  const hour = madridHour(now);
  const daypart =
    hour < 7 || hour >= 21 ? "¡Buenas noches" : hour < 14 ? "¡Buenos días" : "¡Buenas tardes";
  const emoji = hour < 7 || hour >= 21 ? "🌙" : hour < 14 ? "☀️" : "🌤️";

  const dateSentence = format(now, "EEEE, d 'de' MMMM", { locale: es });
  const dateLine = `Es ${dateSentence}.`;
  const pendingLine =
    pendingCount === 0
      ? `Todo en orden hoy en ${householdName}.`
      : pendingCount === 1
        ? `Hay 1 cosa pendiente hoy en ${householdName}.`
        : `Hay ${pendingCount} cosas pendientes hoy en ${householdName}.`;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        {/* Mobile greeting */}
        <h1 className="text-3xl font-bold tracking-tight text-brown md:hidden">
          {firstName ? `¡Hola, ${firstName}!` : "¡Hola!"}
        </h1>
        <p className="mt-1 text-sm text-muted md:hidden">
          Aquí tienes un resumen de tu hogar hoy.
        </p>

        {/* Desktop greeting */}
        <h1 className="hidden text-3xl font-bold tracking-tight text-brown md:block">
          {firstName ? `${daypart}, ${firstName}! ${emoji}` : `${daypart}! ${emoji}`}
        </h1>
        <p className="mt-1 hidden text-sm text-muted md:block">
          {dateLine} {pendingLine}
        </p>
      </div>

      <AddNewButton className="hidden shrink-0 md:inline-flex" />
    </div>
  );
}
