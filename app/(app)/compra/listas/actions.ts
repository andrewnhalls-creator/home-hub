"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { shoppingListSchema, shoppingTripSchema, markPurchasedSchema } from "@/lib/validations/shoppingLists";

export interface ShoppingListFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

function flattenFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function createShoppingList(
  _prevState: ShoppingListFormState,
  formData: FormData,
): Promise<ShoppingListFormState> {
  const parsed = shoppingListSchema.safeParse({
    name: formData.get("name"),
    weekStartDate: formData.get("weekStartDate") || undefined,
    weekEndDate: formData.get("weekEndDate") || undefined,
    plannedBudget: formData.get("plannedBudget") || undefined,
    mainStore: formData.get("mainStore") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shopping_lists")
    .insert({
      household_id: householdId,
      name: parsed.data.name,
      week_start_date: parsed.data.weekStartDate || null,
      week_end_date: parsed.data.weekEndDate || null,
      planned_budget: parsed.data.plannedBudget === "" ? null : parsed.data.plannedBudget,
      main_store: parsed.data.mainStore || null,
      status: "activa",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  revalidatePath("/compra/listas");
  return { success: true };
}

export async function addShoppingTrip(
  listId: string,
  _prevState: ShoppingListFormState,
  formData: FormData,
): Promise<ShoppingListFormState> {
  const parsed = shoppingTripSchema.safeParse({
    store: formData.get("store") || undefined,
    totalAmount: formData.get("totalAmount"),
    shoppingDate: formData.get("shoppingDate") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase.from("shopping_trips").insert({
    household_id: householdId,
    shopping_list_id: listId,
    store: parsed.data.store || null,
    total_amount: parsed.data.totalAmount,
    shopping_date: parsed.data.shoppingDate || null,
    paid_by: user.id,
    created_by: user.id,
  });

  if (error) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  revalidatePath(`/compra/listas/${listId}`);
  return { success: true };
}

export async function deleteShoppingTrip(listId: string, tripId: string) {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  await supabase.from("shopping_trips").delete().eq("id", tripId).eq("household_id", householdId);

  revalidatePath(`/compra/listas/${listId}`);
}

/**
 * Marks a list as bought and links exactly one expense row (category
 * Supermercado) to it — never a second one, enforced by the database's
 * partial unique index on expenses.shopping_list_id. See DATA_MODEL.md
 * "No double-counting grocery spend".
 */
export async function markShoppingListPurchased(
  listId: string,
  _prevState: ShoppingListFormState,
  formData: FormData,
): Promise<ShoppingListFormState> {
  const parsed = markPurchasedSchema.safeParse({
    actualTotal: formData.get("actualTotal") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: trips } = await supabase
    .from("shopping_trips")
    .select("total_amount")
    .eq("shopping_list_id", listId)
    .eq("household_id", householdId);

  const tripsTotal = (trips ?? []).reduce((sum, trip) => sum + Number(trip.total_amount), 0);
  const actualTotal =
    parsed.data.actualTotal === "" || parsed.data.actualTotal === undefined
      ? tripsTotal
      : parsed.data.actualTotal;

  const { data: list } = await supabase
    .from("shopping_lists")
    .select("name")
    .eq("id", listId)
    .eq("household_id", householdId)
    .single();

  if (!list) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  const today = new Date().toISOString().slice(0, 10);

  await supabase
    .from("shopping_lists")
    .update({ status: "comprada", actual_total: actualTotal, shopping_date: today, paid_by: user.id })
    .eq("id", listId)
    .eq("household_id", householdId);

  const { data: categories } = await supabase
    .from("categories")
    .select("id")
    .eq("household_id", householdId)
    .eq("module", "finance")
    .eq("name", "Supermercado")
    .limit(1);
  const categoryId = categories?.[0]?.id ?? null;

  const { data: existingExpense } = await supabase
    .from("expenses")
    .select("id")
    .eq("shopping_list_id", listId)
    .maybeSingle();

  if (existingExpense) {
    await supabase.from("expenses").update({ amount: actualTotal, expense_date: today }).eq("id", existingExpense.id);
  } else if (actualTotal > 0) {
    await supabase.from("expenses").insert({
      household_id: householdId,
      title: `Compra: ${list.name}`,
      amount: actualTotal,
      expense_date: today,
      category_id: categoryId,
      paid_by: user.id,
      shopping_list_id: listId,
      created_by: user.id,
    });
  }

  revalidatePath("/compra/listas");
  revalidatePath(`/compra/listas/${listId}`);
  revalidatePath("/finanzas");
  return { success: true };
}

export async function archiveShoppingList(listId: string) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  await supabase
    .from("shopping_lists")
    .update({ status: "archivada", archived_at: new Date().toISOString(), archived_by: user.id })
    .eq("id", listId)
    .eq("household_id", householdId);

  revalidatePath("/compra/listas");
}

export async function deleteShoppingList(listId: string) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  await supabase
    .from("shopping_lists")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
    .eq("id", listId)
    .eq("household_id", householdId);

  revalidatePath("/compra/listas");
  redirect("/compra/listas");
}
