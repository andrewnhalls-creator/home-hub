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

  const shoppingListId = (formData.get("shoppingListId") as string) || null;

  const { error } = await supabase.from("shopping_items").insert({
    household_id: householdId,
    shopping_list_id: shoppingListId,
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
  if (shoppingListId) revalidatePath(`/compra/listas/${shoppingListId}`);
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

export interface ToggleItemResult {
  ok: boolean;
  conflict?: boolean;
  message?: string;
  current?: { isCompleted: boolean; version: number };
}

/**
 * Idempotent, conflict-aware completion toggle (offline-capable).
 * - `mutationId`: client-generated UUID; a replayed mutation (offline queue
 *   retry, reconnect replay) is detected and returns current state without
 *   re-applying.
 * - `baseVersion`: the trigger-maintained row version the client last saw.
 *   A stale version that would produce the same state succeeds idempotently;
 *   a truly divergent edit returns a Spanish conflict payload instead of
 *   silently overwriting.
 * Callers without opts keep the previous last-write behaviour.
 */
export async function toggleShoppingItemComplete(
  itemId: string,
  isCompleted: boolean,
  opts?: { mutationId?: string; baseVersion?: number },
): Promise<ToggleItemResult> {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  if (opts?.mutationId) {
    const { error: mutationError } = await supabase.from("shopping_mutations").insert({
      id: opts.mutationId,
      household_id: householdId,
      item_id: itemId,
    });
    if (mutationError?.code === "23505") {
      // Already applied — return authoritative state, do not re-apply.
      const { data: current } = await supabase
        .from("shopping_items")
        .select("is_completed, version")
        .eq("id", itemId)
        .eq("household_id", householdId)
        .maybeSingle();
      return current
        ? { ok: true, current: { isCompleted: current.is_completed, version: current.version } }
        : { ok: true };
    }
  }

  const { data: item } = await supabase
    .from("shopping_items")
    .select("name, is_completed, version")
    .eq("id", itemId)
    .eq("household_id", householdId)
    .maybeSingle();

  if (!item) {
    return { ok: false, message: "Este artículo ya no está en la lista." };
  }

  let update = supabase
    .from("shopping_items")
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      completed_by: isCompleted ? user.id : null,
    })
    .eq("id", itemId)
    .eq("household_id", householdId);
  if (opts?.baseVersion !== undefined) {
    update = update.eq("version", opts.baseVersion);
  }
  const { data: updated } = await update.select("is_completed, version");

  if (!updated?.length) {
    // Version moved since the client saw it.
    if (item.is_completed === isCompleted) {
      // Someone else already produced the same state — idempotent success.
      return { ok: true, current: { isCompleted: item.is_completed, version: item.version } };
    }
    return {
      ok: false,
      conflict: true,
      message: `"${item.name}" ha cambiado mientras tanto. Revisa la lista.`,
      current: { isCompleted: item.is_completed, version: item.version },
    };
  }

  if (isCompleted) {
    await supabase.from("activity_log").insert({
      household_id: householdId,
      actor_id: user.id,
      entity_type: "shopping_item",
      action: "completed",
      summary: `Marcó "${item.name}" como comprado`,
    });
  }

  revalidatePath("/compra");
  return { ok: true, current: { isCompleted: updated[0].is_completed, version: updated[0].version } };
}

export async function deleteShoppingItem(itemId: string) {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  await supabase.from("shopping_items").delete().eq("id", itemId).eq("household_id", householdId);

  revalidatePath("/compra");
}

/**
 * Closes a shopping run on the standing list: records the ticket total as a
 * Supermercado expense and removes the bought (completed) items from the list.
 * Amount arrives in cents to avoid any floating-point parsing on the client.
 */
export async function finishQuickPurchase(
  _prevState: ShoppingFormState,
  formData: FormData,
): Promise<ShoppingFormState> {
  const cents = Number(formData.get("amountCents"));
  if (!Number.isInteger(cents) || cents <= 0) {
    return { error: "Introduce el total del ticket." };
  }
  await requireHousehold();
  const supabase = await createClient();

  // Single transaction: expense + clearing the bought items (see migration 040).
  const { error } = await supabase.rpc("finish_quick_purchase", {
    p_amount_cents: cents,
  });

  if (error) {
    return { error: "No se ha podido guardar. Inténtalo de nuevo." };
  }

  revalidatePath("/compra");
  revalidatePath("/finanzas");
  revalidatePath("/dashboard");
  return { success: true };
}

function flattenFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
