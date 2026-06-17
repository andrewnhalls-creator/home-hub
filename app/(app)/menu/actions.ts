"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { mealPlanSchema } from "@/lib/validations/mealplan";

export interface MealPlanFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

export async function upsertMealPlan(
  existingId: string | undefined,
  _prevState: MealPlanFormState,
  formData: FormData,
): Promise<MealPlanFormState> {
  const parsed = mealPlanSchema.safeParse({
    plannedDate: formData.get("plannedDate"),
    mealType: formData.get("mealType"),
    recipeId: formData.get("recipeId") || undefined,
    customName: formData.get("customName") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const payload = {
    household_id: householdId,
    planned_date: parsed.data.plannedDate,
    meal_type: parsed.data.mealType,
    recipe_id: parsed.data.recipeId || null,
    custom_name: parsed.data.recipeId ? null : parsed.data.customName || null,
    notes: parsed.data.notes || null,
    created_by: user.id,
  };

  const { error } = existingId
    ? await supabase
        .from("meal_plans")
        .update(payload)
        .eq("id", existingId)
        .eq("household_id", householdId)
    : await supabase.from("meal_plans").insert(payload);

  if (error) {
    return { error: "No se ha podido guardar. Inténtalo de nuevo." };
  }

  revalidatePath("/menu");
  return { success: true };
}

export async function deleteMealPlan(mealPlanId: string) {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  await supabase.from("meal_plans").delete().eq("id", mealPlanId).eq("household_id", householdId);

  revalidatePath("/menu");
}

export async function generateShoppingListFromMealPlan(formData: FormData) {
  const weekStartDate = formData.get("weekStartDate") as string;
  const weekEndDate = formData.get("weekEndDate") as string;
  const weekLabel = formData.get("weekLabel") as string;

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  // Collect unique recipe IDs planned for this week
  const { data: mealPlans } = await supabase
    .from("meal_plans")
    .select("recipe_id")
    .eq("household_id", householdId)
    .gte("planned_date", weekStartDate)
    .lte("planned_date", weekEndDate)
    .not("recipe_id", "is", null);

  const recipeIds = [
    ...new Set(
      (mealPlans ?? []).map((m) => m.recipe_id).filter((id): id is string => id !== null),
    ),
  ];

  // Fetch all ingredients for those recipes
  type Ingredient = { name: string; quantity: number | null; unit: string | null; category_id: string | null };
  let rawIngredients: Ingredient[] = [];
  if (recipeIds.length > 0) {
    const { data } = await supabase
      .from("recipe_ingredients")
      .select("name, quantity, unit, category_id")
      .in("recipe_id", recipeIds);
    rawIngredients = (data ?? []) as Ingredient[];
  }

  // Deduplicate by (normalised name, unit) — sum numeric quantities
  const deduped = new Map<string, Ingredient>();
  for (const ing of rawIngredients) {
    const key = `${ing.name.trim().toLowerCase()}||${ing.unit ?? ""}`;
    const existing = deduped.get(key);
    if (existing) {
      if (existing.quantity !== null && ing.quantity !== null) {
        existing.quantity += ing.quantity;
      }
    } else {
      deduped.set(key, { ...ing });
    }
  }

  // Create the shopping list
  const { data: list, error: listError } = await supabase
    .from("shopping_lists")
    .insert({
      household_id: householdId,
      name: `Menú ${weekLabel}`,
      week_start_date: weekStartDate,
      week_end_date: weekEndDate,
      status: "activa",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (listError || !list) redirect("/menu");

  // Insert deduplicated items linked to the new list
  const items = [...deduped.values()];
  if (items.length > 0) {
    await supabase.from("shopping_items").insert(
      items.map((ing) => ({
        household_id: householdId,
        shopping_list_id: list.id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        category_id: ing.category_id,
        created_by: user.id,
      })),
    );
  }

  revalidatePath("/compra/listas");
  redirect(`/compra/listas/${list.id}`);
}

function flattenFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
