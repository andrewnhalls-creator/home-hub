"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { recipeSchema, ingredientSchema } from "@/lib/validations/recipes";

export interface RecipeFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

export async function createRecipe(
  _prevState: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  const parsed = recipeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    prepTimeMinutes: formData.get("prepTimeMinutes") || undefined,
    difficulty: formData.get("difficulty") || undefined,
    servings: formData.get("servings") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .insert({
      household_id: householdId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      prep_time_minutes: parsed.data.prepTimeMinutes === "" ? null : parsed.data.prepTimeMinutes,
      difficulty: parsed.data.difficulty === "" ? null : parsed.data.difficulty,
      servings: parsed.data.servings === "" ? null : parsed.data.servings,
      notes: parsed.data.notes || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "No se ha podido guardar. Inténtalo de nuevo." };
  }

  revalidatePath("/menu/recetas");
  redirect(`/menu/recetas/${data.id}`);
}

export async function updateRecipe(
  recipeId: string,
  _prevState: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  const parsed = recipeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    prepTimeMinutes: formData.get("prepTimeMinutes") || undefined,
    difficulty: formData.get("difficulty") || undefined,
    servings: formData.get("servings") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase
    .from("recipes")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      prep_time_minutes: parsed.data.prepTimeMinutes === "" ? null : parsed.data.prepTimeMinutes,
      difficulty: parsed.data.difficulty === "" ? null : parsed.data.difficulty,
      servings: parsed.data.servings === "" ? null : parsed.data.servings,
      notes: parsed.data.notes || null,
    })
    .eq("id", recipeId)
    .eq("household_id", householdId);

  if (error) {
    return { error: "No se ha podido guardar. Inténtalo de nuevo." };
  }

  revalidatePath(`/menu/recetas/${recipeId}`);
  return { success: true };
}

export async function deleteRecipe(recipeId: string) {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  await supabase.from("recipes").delete().eq("id", recipeId).eq("household_id", householdId);

  revalidatePath("/menu/recetas");
  redirect("/menu/recetas");
}

export interface IngredientFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

export async function addIngredient(
  recipeId: string,
  _prevState: IngredientFormState,
  formData: FormData,
): Promise<IngredientFormState> {
  const parsed = ingredientSchema.safeParse({
    name: formData.get("name"),
    quantity: formData.get("quantity") || undefined,
    unit: formData.get("unit") || undefined,
    categoryId: formData.get("categoryId") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: recipe } = await supabase
    .from("recipes")
    .select("id")
    .eq("id", recipeId)
    .eq("household_id", householdId)
    .single();

  if (!recipe) {
    return { error: "No se ha podido guardar. Inténtalo de nuevo." };
  }

  await supabase.from("recipe_ingredients").insert({
    recipe_id: recipeId,
    name: parsed.data.name,
    quantity: parsed.data.quantity === "" ? null : parsed.data.quantity,
    unit: parsed.data.unit || null,
    category_id: parsed.data.categoryId || null,
  });

  revalidatePath(`/menu/recetas/${recipeId}`);
  return { success: true };
}

export async function deleteIngredient(recipeId: string, ingredientId: string) {
  await requireHousehold();
  const supabase = await createClient();

  await supabase.from("recipe_ingredients").delete().eq("id", ingredientId);

  revalidatePath(`/menu/recetas/${recipeId}`);
}

export async function addRecipeIngredientsToShoppingList(recipeId: string) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: recipe } = await supabase
    .from("recipes")
    .select("name")
    .eq("id", recipeId)
    .eq("household_id", householdId)
    .single();

  const { data: ingredients } = await supabase
    .from("recipe_ingredients")
    .select("name, quantity, unit, category_id")
    .eq("recipe_id", recipeId);

  if (!recipe || !ingredients || ingredients.length === 0) return;

  await supabase.from("shopping_items").insert(
    ingredients.map((ingredient) => ({
      household_id: householdId,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      category_id: ingredient.category_id,
      created_by: user.id,
    })),
  );

  await supabase.from("activity_log").insert({
    household_id: householdId,
    actor_id: user.id,
    entity_type: "recipe",
    action: "added_to_shopping_list",
    summary: `Añadió los ingredientes de "${recipe.name}" a la compra`,
  });

  revalidatePath("/compra");
}

function flattenFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
