"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { wishlistItemSchema } from "@/lib/validations/wishlist";

export interface WishlistFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

function toFirstOfMonth(yearMonth: string | undefined): string | null {
  if (!yearMonth) return null;
  return `${yearMonth}-01`;
}

function flattenFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function createWishlistItem(
  _prevState: WishlistFormState,
  formData: FormData,
): Promise<WishlistFormState> {
  const parsed = wishlistItemSchema.safeParse({
    name: formData.get("name"),
    estimatedCost: formData.get("estimatedCost") || undefined,
    priority: formData.get("priority") || "normal",
    targetMonth: formData.get("targetMonth") || undefined,
    url: formData.get("url") || undefined,
    status: formData.get("status") || "idea",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: item, error } = await supabase.from("wishlist_items").insert({
    household_id: householdId,
    name: parsed.data.name,
    estimated_cost: parsed.data.estimatedCost === "" ? null : parsed.data.estimatedCost,
    priority: parsed.data.priority,
    target_month: toFirstOfMonth(parsed.data.targetMonth),
    url: parsed.data.url || null,
    status: parsed.data.status,
    notes: parsed.data.notes || null,
    created_by: user.id,
  }).select("id").single();

  if (error || !item) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  // Notify other household members.
  const { data: otherMembers } = await supabase
    .from("household_members")
    .select("user_id")
    .eq("household_id", householdId)
    .neq("user_id", user.id);

  if (otherMembers && otherMembers.length > 0) {
    await supabase.from("scheduled_notifications").insert(
      otherMembers.map((m) => ({
        household_id: householdId,
        user_id: m.user_id,
        category: "actividad_hogar",
        entity_type: "wishlist_item",
        entity_id: item.id,
        scheduled_for: new Date().toISOString(),
        title: "Nuevo deseo añadido",
        body: `Se ha añadido "${parsed.data.name}" a la lista de deseos.`,
      })),
    );
  }

  revalidatePath("/deseos");
  return { success: true };
}

export async function voteWishlistItem(itemId: string, vote: "quiero" | "no_ahora") {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  // Read current votes and member count in parallel.
  const [{ data: item }, { data: members }] = await Promise.all([
    supabase
      .from("wishlist_items")
      .select("votes")
      .eq("id", itemId)
      .eq("household_id", householdId)
      .single(),
    supabase.from("household_members").select("user_id").eq("household_id", householdId),
  ]);

  if (!item || !members) return;

  const currentVotes = (item.votes as Record<string, string>) ?? {};
  const updatedVotes = { ...currentVotes, [user.id]: vote };

  const memberCount = members.length;
  const voteValues = Object.values(updatedVotes);
  let newStatus: string = "idea";
  if (voteValues.includes("no_ahora")) {
    newStatus = "descartado";
  } else if (voteValues.filter((v) => v === "quiero").length >= memberCount) {
    newStatus = "aprobado";
  }

  await supabase
    .from("wishlist_items")
    .update({ votes: updatedVotes, status: newStatus })
    .eq("id", itemId)
    .eq("household_id", householdId);

  revalidatePath("/deseos");
}

export async function updateWishlistItem(
  itemId: string,
  _prevState: WishlistFormState,
  formData: FormData,
): Promise<WishlistFormState> {
  const parsed = wishlistItemSchema.safeParse({
    name: formData.get("name"),
    estimatedCost: formData.get("estimatedCost") || undefined,
    priority: formData.get("priority") || "normal",
    targetMonth: formData.get("targetMonth") || undefined,
    url: formData.get("url") || undefined,
    status: formData.get("status") || "idea",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase
    .from("wishlist_items")
    .update({
      name: parsed.data.name,
      estimated_cost: parsed.data.estimatedCost === "" ? null : parsed.data.estimatedCost,
      priority: parsed.data.priority,
      target_month: toFirstOfMonth(parsed.data.targetMonth),
      url: parsed.data.url || null,
      status: parsed.data.status,
      notes: parsed.data.notes || null,
    })
    .eq("id", itemId)
    .eq("household_id", householdId);

  if (error) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  revalidatePath("/deseos");
  return { success: true };
}

export async function deleteWishlistItem(itemId: string) {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  await supabase.from("wishlist_items").delete().eq("id", itemId).eq("household_id", householdId);

  revalidatePath("/deseos");
}
