"use server";

import { redirect } from "next/navigation";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createHouseholdSchema, joinHouseholdSchema } from "@/lib/validations/onboarding";

export interface OnboardingActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createHousehold(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const parsed = createHouseholdSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_household", { p_name: parsed.data.name });

  if (error) {
    return { error: "No se ha podido crear el hogar. Inténtalo de nuevo." };
  }

  redirect("/dashboard");
}

export async function joinHousehold(
  _prevState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const parsed = joinHouseholdSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("redeem_household_invite", {
    p_code: parsed.data.code,
  });

  if (error) {
    // Surface the RPC's own Spanish messages for known cases; anything else
    // (including truly invalid codes) stays generic and non-enumerating.
    const known = [
      "Ya eres miembro de este hogar",
      "Ya perteneces al máximo de 4 hogares permitidos",
      "Este hogar ya tiene el máximo de miembros",
    ].find((message) => error.message.includes(message));
    return { error: known ? `${known}.` : "Código de invitación no válido o caducado." };
  }

  redirect("/dashboard");
}

function flattenFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
