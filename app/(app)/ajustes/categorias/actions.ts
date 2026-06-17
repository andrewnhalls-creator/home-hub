"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";

export interface CategoriaActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

const categorySchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio.").max(50, "Máximo 50 caracteres."),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color no válido.").optional(),
  module: z.enum(
    ["shopping", "finance", "reminders", "chores", "documents", "wishlist", "meals"],
    { message: "Módulo no válido." },
  ),
});

function flattenFieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function createCategory(
  _prevState: CategoriaActionState,
  formData: FormData,
): Promise<CategoriaActionState> {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
    module: formData.get("module"),
  });
  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase.from("categories").insert({
    household_id: householdId,
    name: parsed.data.name,
    color: parsed.data.color ?? null,
    module: parsed.data.module,
  });

  if (error) return { error: "No se ha podido crear la categoría. Inténtalo de nuevo." };

  revalidatePath("/ajustes/categorias");
  return { success: true };
}

const updateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Este campo es obligatorio.").max(50, "Máximo 50 caracteres."),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color no válido.").optional(),
});

export async function updateCategory(
  _prevState: CategoriaActionState,
  formData: FormData,
): Promise<CategoriaActionState> {
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .update({ name: parsed.data.name, color: parsed.data.color ?? null })
    .eq("id", parsed.data.id)
    .eq("household_id", householdId);

  if (error) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  revalidatePath("/ajustes/categorias");
  return { success: true };
}

export async function archiveCategory(
  _prevState: CategoriaActionState,
  formData: FormData,
): Promise<CategoriaActionState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "Categoría no válida." };

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .update({ archived_at: new Date().toISOString(), archived_by: user.id })
    .eq("id", id)
    .eq("household_id", householdId);

  if (error) return { error: "No se ha podido archivar la categoría. Inténtalo de nuevo." };

  revalidatePath("/ajustes/categorias");
  return { success: true };
}

export async function restoreCategory(
  _prevState: CategoriaActionState,
  formData: FormData,
): Promise<CategoriaActionState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "Categoría no válida." };

  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .update({ archived_at: null, archived_by: null })
    .eq("id", id)
    .eq("household_id", householdId);

  if (error) return { error: "No se ha podido restaurar la categoría. Inténtalo de nuevo." };

  revalidatePath("/ajustes/categorias");
  return { success: true };
}
