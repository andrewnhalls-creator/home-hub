import Link from "next/link";
import { CaretLeft, CaretRight, BookOpen } from "@phosphor-icons/react/dist/ssr";
import { addDays, addWeeks, format, startOfWeek, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MealSlot } from "@/components/meals/MealSlot";
import { GenerateListButton } from "@/components/meals/GenerateListButton";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import type { MealType } from "@/lib/types";

const MEAL_TYPES: { type: MealType; label: string }[] = [
  { type: "desayuno", label: "Desayuno" },
  { type: "comida", label: "Comida" },
  { type: "cena", label: "Cena" },
  { type: "snack", label: "Snack" },
];

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const { householdId } = await requireHousehold();
  const { start } = await searchParams;

  const weekStart = start
    ? startOfWeek(new Date(start), { weekStartsOn: 1 })
    : startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weekEnd = addDays(weekStart, 6);
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");
  const prevWeekStr = format(subWeeks(weekStart, 1), "yyyy-MM-dd");
  const nextWeekStr = format(addWeeks(weekStart, 1), "yyyy-MM-dd");

  const sameMonth = format(weekStart, "M") === format(weekEnd, "M");
  const weekLabel = sameMonth
    ? `${format(weekStart, "d", { locale: es })}–${format(weekEnd, "d 'de' MMMM yyyy", { locale: es })}`
    : `${format(weekStart, "d MMM", { locale: es })}–${format(weekEnd, "d MMM yyyy", { locale: es })}`;
  const compactWeekLabel = sameMonth
    ? `${format(weekStart, "d", { locale: es })} – ${format(weekEnd, "d 'de' MMMM", { locale: es })}`
    : `${format(weekStart, "d MMM", { locale: es })} – ${format(weekEnd, "d MMM", { locale: es })}`;
  const isCurrentWeek =
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd") === weekStartStr;

  const supabase = await createClient();
  const [{ data: meals }, { data: recipes }] = await Promise.all([
    supabase
      .from("meal_plans")
      .select("id, planned_date, meal_type, recipe_id, custom_name, recipes(name)")
      .eq("household_id", householdId)
      .gte("planned_date", weekStartStr)
      .lte("planned_date", weekEndStr),
    supabase
      .from("recipes")
      .select("id, name")
      .eq("household_id", householdId)
      .order("name", { ascending: true }),
  ]);

  const mealsByDay = new Map<string, typeof meals>();
  for (const meal of meals ?? []) {
    const key = `${meal.planned_date}_${meal.meal_type}`;
    mealsByDay.set(key, [meal] as typeof meals);
  }

  return (
    <div className="flex flex-col gap-4">
      <SegmentedToggle />

      {/* Week navigator */}
      <div className="flex items-center justify-between">
        <Link
          href={`/menu?start=${prevWeekStr}`}
          aria-label="Semana anterior"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted transition hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
        >
          <CaretLeft className="h-4 w-4" aria-hidden />
        </Link>
        <div className="text-center">
          <p className="text-base font-bold text-brown">{compactWeekLabel}</p>
          {isCurrentWeek && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
              Esta semana
            </p>
          )}
        </div>
        <Link
          href={`/menu?start=${nextWeekStr}`}
          aria-label="Semana siguiente"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted transition hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
        >
          <CaretRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <GenerateListButton
        weekStartDate={weekStartStr}
        weekEndDate={weekEndStr}
        weekLabel={weekLabel}
      />
      <Link
        href="/menu/recetas"
        className="-mt-1 flex min-h-[44px] items-center justify-center gap-2 rounded-full text-sm font-medium text-amber transition hover:bg-amber/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
      >
        <BookOpen className="h-4 w-4" aria-hidden />
        Ver recetas del hogar
      </Link>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:gap-6">
        {days.map((day) => {
          const dayStr = format(day, "yyyy-MM-dd");
          const dayLabel = format(day, "EEEE", { locale: es });
          const dayNumber = format(day, "d");
          return (
            <div key={dayStr}>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold capitalize text-brown">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-terracotta/10 text-xs font-bold tabular-nums text-terracotta"
                  aria-hidden
                >
                  {dayNumber}
                </span>
                {dayLabel}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {MEAL_TYPES.map(({ type, label }) => {
                  const meal = mealsByDay.get(`${dayStr}_${type}`)?.[0];
                  return (
                    <MealSlot
                      key={type}
                      date={dayStr}
                      mealType={type}
                      label={label}
                      meal={
                        meal
                          ? {
                              id: meal.id,
                              custom_name: meal.custom_name,
                              recipe_id: meal.recipe_id,
                              recipes: meal.recipes as unknown as { name: string } | null,
                            }
                          : undefined
                      }
                      recipes={recipes ?? []}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
