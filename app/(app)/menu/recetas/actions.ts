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

// ---------------------------------------------------------------------------
// Recipe URL import
// ---------------------------------------------------------------------------

export interface ImportRecipeState {
  error?: string;
  data?: {
    name: string;
    description?: string;
    servings?: number;
    ingredients?: string[];
  };
}

export async function importRecipeFromUrl(
  _prevState: ImportRecipeState,
  formData: FormData,
): Promise<ImportRecipeState> {
  const raw = String(formData.get("url") ?? "").trim();

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { error: "La URL no es válida. Introduce una URL completa (https://...)." };
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { error: "Solo se admiten URLs con protocolo http o https." };
  }

  // Reject obviously private/loopback hosts
  const host = url.hostname.toLowerCase();
  const blockedPatterns = [/^localhost$/, /^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./];
  if (blockedPatterns.some((r) => r.test(host))) {
    return { error: "No se ha podido importar la receta. Comprueba la URL e inténtalo de nuevo." };
  }

  let html: string;
  try {
    const res = await fetch(raw, {
      headers: { "User-Agent": "HomeHub/1.0 (+recipe-import)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch {
    return { error: "No hemos podido importar la receta. Comprueba la URL e inténtalo de nuevo." };
  }

  // Extract all JSON-LD blocks
  const scriptRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRe.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1]) as unknown;
      const items: unknown[] = Array.isArray(json)
        ? json
        : typeof json === "object" && json !== null && "@graph" in json
          ? (json as Record<string, unknown[]>)["@graph"]
          : [json];

      for (const item of items) {
        if (typeof item !== "object" || item === null) continue;
        const obj = item as Record<string, unknown>;
        const type = obj["@type"];
        const isRecipe = type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"));
        if (!isRecipe) continue;

        const name = typeof obj["name"] === "string" ? obj["name"].trim() : undefined;
        if (!name) continue;

        const description =
          typeof obj["description"] === "string" ? obj["description"].trim() : undefined;

        const rawYield = obj["recipeYield"];
        let servings: number | undefined;
        if (typeof rawYield === "number") {
          servings = rawYield;
        } else if (typeof rawYield === "string") {
          const n = parseInt(rawYield, 10);
          if (!isNaN(n)) servings = n;
        } else if (Array.isArray(rawYield) && rawYield.length > 0) {
          const n = parseInt(String(rawYield[0]), 10);
          if (!isNaN(n)) servings = n;
        }

        const rawIngredients = obj["recipeIngredient"];
        const ingredients = Array.isArray(rawIngredients)
          ? rawIngredients.filter((s): s is string => typeof s === "string")
          : undefined;

        return { data: { name, description, servings, ingredients } };
      }
    } catch {
      // malformed JSON-LD block — try next
    }
  }

  return { error: "No hemos podido importar la receta. Comprueba la URL e inténtalo de nuevo." };
}

function flattenFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
