import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ShoppingCart, ArrowLeft, ForkKnife, Clock, Users, ChartBar, PencilSimple, CaretDown,
} from "@phosphor-icons/react/dist/ssr";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RecipeForm } from "@/components/meals/RecipeForm";
import { IngredientList } from "@/components/meals/IngredientList";
import { RecipeDeleteButton } from "@/components/meals/RecipeDeleteButton";
import { Button } from "@/components/ui/Button";
import { updateRecipe, addRecipeIngredientsToShoppingList } from "@/app/(app)/menu/recetas/actions";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const [{ data: recipe }, { data: ingredients }, { data: categories }] = await Promise.all([
    supabase.from("recipes").select("*").eq("id", id).eq("household_id", householdId).single(),
    supabase.from("recipe_ingredients").select("*").eq("recipe_id", id).order("created_at", { ascending: true }),
    supabase.from("categories").select("*").eq("household_id", householdId).eq("module", "shopping"),
  ]);

  if (!recipe) notFound();

  const preparationSteps = (recipe.notes ?? "")
    .split(/\n+/)
    .map((step: string) => step.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/menu/recetas"
        className="flex min-h-[44px] w-fit items-center gap-1.5 rounded-full pr-3 text-sm font-medium text-muted transition hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
      >
        <ArrowLeft weight="bold" className="h-4 w-4" aria-hidden />
        Recetas
      </Link>

      {/* Hero */}
      <div className="flex items-start gap-4">
        <span
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--radius-xl)] bg-sage/10"
          aria-hidden
        >
          <ForkKnife weight="regular" size={30} className="text-sage" />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold leading-tight text-brown">{recipe.name}</h1>
          {recipe.description && <p className="mt-1 text-sm text-muted">{recipe.description}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            {recipe.prep_time_minutes != null && (
              <span className="flex items-center gap-1">
                <Clock size={13} aria-hidden /> {recipe.prep_time_minutes} min
              </span>
            )}
            {recipe.difficulty && (
              <span className="flex items-center gap-1 capitalize">
                <ChartBar size={13} aria-hidden /> {recipe.difficulty}
              </span>
            )}
            {recipe.servings != null && (
              <span className="flex items-center gap-1">
                <Users size={13} aria-hidden /> {recipe.servings} comensales
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <section aria-label="Ingredientes" className="rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <h2 className="mb-3 text-lg font-semibold text-brown">Ingredientes</h2>
        <IngredientList recipeId={recipe.id} ingredients={ingredients ?? []} categories={categories ?? []} />
      </section>

      <form action={addRecipeIngredientsToShoppingList.bind(null, recipe.id)}>
        <Button type="submit" className="w-full">
          <ShoppingCart className="h-4 w-4" aria-hidden />
          Añadir ingredientes a la compra
        </Button>
      </form>

      {/* Preparation */}
      {preparationSteps.length > 0 && (
        <section aria-label="Preparación">
          <h2 className="mb-3 text-lg font-semibold text-brown">Preparación</h2>
          <ol className="flex flex-col gap-3">
            {preparationSteps.map((step: string, index: number) => (
              <li key={index} className="flex gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-xs font-bold tabular-nums text-terracotta"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-brown">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Edit */}
      <details className="group rounded-[var(--radius-xl)] border border-border bg-card shadow-[var(--shadow-card)]">
        <summary className="flex min-h-[52px] cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-brown [&::-webkit-details-marker]:hidden">
          <PencilSimple className="h-4 w-4 text-muted" aria-hidden />
          Editar receta
          <CaretDown className="ml-auto h-4 w-4 text-muted transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="flex flex-col gap-5 border-t border-border p-4">
          <RecipeForm action={updateRecipe.bind(null, recipe.id)} recipe={recipe} />
          <RecipeDeleteButton recipeId={recipe.id} />
        </div>
      </details>
    </div>
  );
}
