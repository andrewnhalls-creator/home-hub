import Link from "next/link";
import { ForkKnife, ArrowRight } from "@phosphor-icons/react/dist/ssr";

interface TodayMealCardProps {
  /** e.g. [{ label: "Comida", name: "Lentejas con chorizo" }] */
  meals: { label: string; name: string }[];
}

export function TodayMealCard({ meals }: TodayMealCardProps) {
  if (meals.length === 0) return null;
  const [first, ...rest] = meals;

  return (
    <Link
      href="/menu"
      className="group relative block overflow-hidden rounded-[var(--radius-xl)] border border-sage/25 bg-gradient-to-br from-sage/[0.14] to-sage/[0.04] p-5 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sage text-cream" aria-hidden>
          <ForkKnife weight="fill" size={14} />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-sage">
          Hoy para comer
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold leading-tight text-brown">{first.name}</p>
      <p className="mt-0.5 text-xs text-muted">{first.label}</p>

      {rest.length > 0 && (
        <ul className="mt-2 flex flex-col gap-0.5">
          {rest.map((meal) => (
            <li key={`${meal.label}-${meal.name}`} className="text-sm text-muted">
              {meal.label}: <span className="font-medium text-brown">{meal.name}</span>
            </li>
          ))}
        </ul>
      )}

      <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-sage group-hover:underline">
        Ver el menú
        <ArrowRight weight="bold" size={14} aria-hidden />
      </span>
    </Link>
  );
}
