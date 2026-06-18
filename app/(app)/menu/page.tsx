import Link from "next/link";
import { CaretLeft, CaretRight, BookOpen } from "@phosphor-icons/react/dist/ssr";
import { addDays, addWeeks, format, startOfWeek, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MealSlot } from "@/components/meals/MealSlot";
import { GenerateListButton } from "@/components/meals/GenerateListButton";
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
      <div className="flex items-center justify-between">
        <Link
          href={`/menu?start=${prevWeekStr}`}
          aria-label="Semana anterior"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-sand"
        >
          <CaretLeft className="h-5 w-5" aria-hidden />
        </Link>
        <p className="text-sm font-medium text-brown">
          {format(weekStart, "dd/MM/yyyy")} - {format(weekEnd, "dd/MM/yyyy")}
        </p>
        <Link
          href={`/menu?start=${nextWeekStr}`}
          aria-label="Semana siguiente"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-sand"
        >
          <CaretRight className="h-5 w-5" aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/menu/recetas"
          className="flex items-center justify-center gap-2 rounded-xl border border-terracotta px-4 py-3 text-sm font-medium text-terracotta"
        >
          <BookOpen className="h-4 w-4" aria-hidden />
          Recetas
        </Link>
        <GenerateListButton
          weekStartDate={weekStartStr}
          weekEndDate={weekEndStr}
          weekLabel={weekLabel}
        />
      </div>

      <div className="flex flex-col gap-3">
        {days.map((day) => {
          const dayStr = format(day, "yyyy-MM-dd");
          const dayLabel = format(day, "EEEE dd/MM", { locale: es });
          return (
            <div key={dayStr}>
              <p className="mb-2 text-sm font-semibold capitalize text-brown">{dayLabel}</p>
              <div className="grid grid-cols-2 gap-2">
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
