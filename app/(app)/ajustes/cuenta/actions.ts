"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";

export interface AccountActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
}

const changePasswordSchema = z
  .object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirm: z.string().min(1, "Este campo es obligatorio."),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Las contraseñas no coinciden.",
    path: ["confirm"],
  });

const changeEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Este campo es obligatorio.")
    .email("Introduce un correo electrónico válido."),
});

function flattenFieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function changePassword(
  _prevState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const parsed = changePasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  await requireHousehold();
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) return { error: "No se ha podido actualizar la contraseña. Inténtalo de nuevo." };

  return { success: "Contraseña actualizada correctamente." };
}

export async function changeEmail(
  _prevState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const parsed = changeEmailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  await requireHousehold();
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email: parsed.data.email });

  if (error) return { error: "No se ha podido cambiar el correo. Inténtalo de nuevo." };

  return {
    success:
      "Te hemos enviado un correo de confirmación a la nueva dirección. El cambio no será efectivo hasta que confirmes el enlace.",
  };
}
