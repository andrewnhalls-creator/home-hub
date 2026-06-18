import Link from "next/link";
import { notFound } from "next/navigation";
import { ShoppingCart } from "@phosphor-icons/react/dist/ssr";
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

  return (
    <div className="flex flex-col gap-6">
      <Link href="/menu/recetas" className="text-sm font-medium text-terracotta">
        ← Volver a recetas
      </Link>

      <RecipeForm action={updateRecipe.bind(null, recipe.id)} recipe={recipe} />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-brown">Ingredientes</h2>
        <IngredientList recipeId={recipe.id} ingredients={ingredients ?? []} categories={categories ?? []} />
      </div>

      <form action={addRecipeIngredientsToShoppingList.bind(null, recipe.id)}>
        <Button type="submit" variant="secondary" className="w-full">
          <ShoppingCart className="h-4 w-4" aria-hidden />
          Añadir ingredientes a la compra
        </Button>
      </form>

      <RecipeDeleteButton recipeId={recipe.id} />
    </div>
  );
}
