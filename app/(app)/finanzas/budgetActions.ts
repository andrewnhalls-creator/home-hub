"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { categoryBudgetSchema } from "@/lib/validations/finance";

export interface BudgetFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

function flattenFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function upsertCategoryBudget(
  _prevState: BudgetFormState,
  formData: FormData,
): Promise<BudgetFormState> {
  const parsed = categoryBudgetSchema.safeParse({
    categoryId: formData.get("categoryId"),
    monthlyAmount: formData.get("monthlyAmount"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase.from("category_budgets").upsert(
    {
      household_id: householdId,
      category_id: parsed.data.categoryId,
      monthly_amount: parsed.data.monthlyAmount,
      notes: parsed.data.notes || null,
      created_by: user.id,
    },
    { onConflict: "household_id,category_id" },
  );

  if (error) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  revalidatePath("/finanzas");
  return { success: true };
}

export async function deleteCategoryBudget(budgetId: string): Promise<void> {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  await supabase
    .from("category_budgets")
    .delete()
    .eq("id", budgetId)
    .eq("household_id", householdId);

  revalidatePath("/finanzas");
}
