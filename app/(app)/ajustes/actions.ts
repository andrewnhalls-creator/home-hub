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

  const { count } = await supabase
    .from("household_members")
    .select("id", { count: "exact", head: true })
    .eq("household_id", householdId);

  if ((count ?? 0) >= 5) {
    return { error: "Este hogar ya tiene el máximo de 5 miembros." };
  }

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

// ---------------------------------------------------------------------------
// Multi-household actions
// ---------------------------------------------------------------------------

export interface HouseholdSwitchState {
  error?: string;
  success?: boolean;
}

export async function switchHousehold(
  _prevState: HouseholdSwitchState,
  formData: FormData,
): Promise<HouseholdSwitchState> {
  const householdId = formData.get("householdId") as string | null;
  if (!householdId) return { error: "Hogar no especificado." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("switch_household", { p_household_id: householdId });

  if (error) return { error: "No se ha podido cambiar de hogar. Inténtalo de nuevo." };

  revalidatePath("/", "layout");
  return { success: true };
}

export interface CreateHouseholdState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

export async function createAdditionalHousehold(
  _prevState: CreateHouseholdState,
  formData: FormData,
): Promise<CreateHouseholdState> {
  const parsed = householdNameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_household", { p_name: parsed.data.name });

  if (error) {
    if (error.message.includes("4 hogares")) {
      return { error: "Ya tienes el máximo de 4 hogares permitidos." };
    }
    return { error: "No se ha podido crear el hogar. Inténtalo de nuevo." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export interface JoinHouseholdState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

export async function joinAdditionalHousehold(
  _prevState: JoinHouseholdState,
  formData: FormData,
): Promise<JoinHouseholdState> {
  const code = (formData.get("code") as string | null)?.trim().toUpperCase();
  if (!code) return { fieldErrors: { code: "Introduce el código de invitación." } };

  const supabase = await createClient();
  const { error } = await supabase.rpc("redeem_household_invite", { p_code: code });

  if (error) {
    if (error.message.includes("4 hogares")) {
      return { error: "Ya tienes el máximo de 4 hogares permitidos." };
    }
    return { error: "Código de invitación no válido o caducado." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
