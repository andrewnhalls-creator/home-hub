"use server";

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

// The code is generated and hashed server-side (RPC); the plaintext is
// returned exactly once and never stored.
export async function generateInviteCode(): Promise<InviteActionState> {
  const { role } = await requireHousehold();
  if (role !== "owner") {
    return { error: "Solo la persona propietaria del hogar puede generar invitaciones." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_household_invite");

  if (error || !data?.[0]) {
    return { error: "No se ha podido generar el código. Inténtalo de nuevo." };
  }

  revalidatePath("/ajustes");
  return { code: data[0].invite_code, expiresAt: data[0].invite_expires_at };
}

export async function revokeInvite(inviteId: string): Promise<InviteActionState> {
  const { role } = await requireHousehold();
  if (role !== "owner") {
    return { error: "Solo la persona propietaria del hogar puede revocar invitaciones." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("revoke_household_invite", {
    p_invite_id: inviteId,
  });

  if (error) return { error: "No se ha podido revocar la invitación. Inténtalo de nuevo." };

  revalidatePath("/ajustes");
  return {};
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
