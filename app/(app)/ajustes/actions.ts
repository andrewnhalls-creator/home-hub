"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { householdNameSchema, profileDisplayNameSchema } from "@/lib/validations/settings";

export interface SettingsActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

export interface InviteActionState {
  error?: string;
  code?: string;
  expiresAt?: string;
}

function flattenFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

function generateCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += alphabet[bytes[i] % alphabet.length];
  }
  return code;
}

export async function updateHouseholdName(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const parsed = householdNameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { householdId, role } = await requireHousehold();
  if (role !== "owner") {
    return { error: "Solo la persona propietaria del hogar puede cambiar este dato." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("households")
    .update({ name: parsed.data.name })
    .eq("id", householdId);

  if (error) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  revalidatePath("/ajustes", "layout");
  return { success: true };
}

export async function updateProfileDisplayName(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const parsed = profileDisplayNameSchema.safeParse({
    displayName: formData.get("displayName"),
  });
  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const [{ error: profileError }, { error: memberError }] = await Promise.all([
    supabase
      .from("profiles")
      .update({ display_name: parsed.data.displayName })
      .eq("id", user.id),
    supabase
      .from("household_members")
      .update({ display_name: parsed.data.displayName })
      .eq("household_id", householdId)
      .eq("user_id", user.id),
  ]);

  if (profileError || memberError) {
    return { error: "No se ha podido guardar. Inténtalo de nuevo." };
  }

  revalidatePath("/ajustes");
  return { success: true };
}

export async function generateInviteCode(): Promise<InviteActionState> {
  const { user, householdId, role } = await requireHousehold();
  if (role !== "owner") {
    return { error: "Solo la persona propietaria del hogar puede generar invitaciones." };
  }

  const supabase = await createClient();
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("household_invites").insert({
    household_id: householdId,
    code,
    created_by: user.id,
    expires_at: expiresAt,
  });

  if (error) return { error: "No se ha podido generar el código. Inténtalo de nuevo." };

  revalidatePath("/ajustes");
  return { code, expiresAt };
}
