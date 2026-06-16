"use server";

import { revalidatePath } from "next/cache";
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

function flattenFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
