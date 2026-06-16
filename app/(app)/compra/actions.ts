"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { shoppingItemSchema } from "@/lib/validations/shopping";

export interface ShoppingFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

export async function addShoppingItem(
  _prevState: ShoppingFormState,
  formData: FormData,
): Promise<ShoppingFormState> {
  const parsed = shoppingItemSchema.safeParse({
    name: formData.get("name"),
    quantity: formData.get("quantity") || undefined,
    unit: formData.get("unit") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    store: formData.get("store") || undefined,
    priority: formData.get("priority") || "normal",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase.from("shopping_items").insert({
    household_id: householdId,
    name: parsed.data.name,
    quantity: parsed.data.quantity === "" ? null : parsed.data.quantity,
    unit: parsed.data.unit || null,
    category_id: parsed.data.categoryId || null,
    store: parsed.data.store || null,
    priority: parsed.data.priority,
    notes: parsed.data.notes || null,
    created_by: user.id,
  });

  if (error) {
    return { error: "No se ha podido guardar. Inténtalo de nuevo." };
  }

  await supabase.from("activity_log").insert({
    household_id: householdId,
    actor_id: user.id,
    entity_type: "shopping_item",
    action: "created",
    summary: `Añadió "${parsed.data.name}" a la compra`,
  });

  revalidatePath("/compra");
  return { success: true };
}

export async function updateShoppingItem(
  itemId: string,
  _prevState: ShoppingFormState,
  formData: FormData,
): Promise<ShoppingFormState> {
  const parsed = shoppingItemSchema.safeParse({
    name: formData.get("name"),
    quantity: formData.get("quantity") || undefined,
    unit: formData.get("unit") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    store: formData.get("store") || undefined,
    priority: formData.get("priority") || "normal",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase
    .from("shopping_items")
    .update({
      name: parsed.data.name,
      quantity: parsed.data.quantity === "" ? null : parsed.data.quantity,
      unit: parsed.data.unit || null,
      category_id: parsed.data.categoryId || null,
      store: parsed.data.store || null,
      priority: parsed.data.priority,
      notes: parsed.data.notes || null,
    })
    .eq("id", itemId)
    .eq("household_id", householdId);

  if (error) {
    return { error: "No se ha podido guardar. Inténtalo de nuevo." };
  }

  revalidatePath("/compra");
  return { success: true };
}

export async function toggleShoppingItemComplete(itemId: string, isCompleted: boolean) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("shopping_items")
    .select("name")
    .eq("id", itemId)
    .single();

  await supabase
    .from("shopping_items")
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      completed_by: isCompleted ? user.id : null,
    })
    .eq("id", itemId)
    .eq("household_id", householdId);

  if (isCompleted && item) {
    await supabase.from("activity_log").insert({
      household_id: householdId,
      actor_id: user.id,
      entity_type: "shopping_item",
      action: "completed",
      summary: `Marcó "${item.name}" como comprado`,
    });
  }

  revalidatePath("/compra");
}

export async function deleteShoppingItem(itemId: string) {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  await supabase.from("shopping_items").delete().eq("id", itemId).eq("household_id", householdId);

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
