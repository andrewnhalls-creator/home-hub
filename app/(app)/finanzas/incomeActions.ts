"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { incomeSourceSchema } from "@/lib/validations/finance";

export interface IncomeFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

function flattenFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function createIncomeSource(
  _prevState: IncomeFormState,
  formData: FormData,
): Promise<IncomeFormState> {
  const parsed = incomeSourceSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    frequency: formData.get("frequency") || "mensual",
    earnerName: formData.get("earnerName") || undefined,
    paymentDay: formData.get("paymentDay") || undefined,
    bankAccount: formData.get("bankAccount") || undefined,
    isActive: formData.get("isActive") === "on",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase.from("income_sources").insert({
    household_id: householdId,
    name: parsed.data.name,
    amount: parsed.data.amount,
    frequency: parsed.data.frequency,
    earner_name: parsed.data.earnerName || null,
    payment_day: parsed.data.paymentDay === "" ? null : (parsed.data.paymentDay ?? null),
    bank_account: parsed.data.bankAccount || null,
    is_active: parsed.data.isActive,
    notes: parsed.data.notes || null,
    created_by: user.id,
  });

  if (error) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  revalidatePath("/finanzas");
  return { success: true };
}

export async function updateIncomeSource(
  sourceId: string,
  _prevState: IncomeFormState,
  formData: FormData,
): Promise<IncomeFormState> {
  const parsed = incomeSourceSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    frequency: formData.get("frequency") || "mensual",
    earnerName: formData.get("earnerName") || undefined,
    paymentDay: formData.get("paymentDay") || undefined,
    bankAccount: formData.get("bankAccount") || undefined,
    isActive: formData.get("isActive") === "on",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase
    .from("income_sources")
    .update({
      name: parsed.data.name,
      amount: parsed.data.amount,
      frequency: parsed.data.frequency,
      earner_name: parsed.data.earnerName || null,
      payment_day: parsed.data.paymentDay === "" ? null : (parsed.data.paymentDay ?? null),
      bank_account: parsed.data.bankAccount || null,
      is_active: parsed.data.isActive,
      notes: parsed.data.notes || null,
    })
    .eq("id", sourceId)
    .eq("household_id", householdId);

  if (error) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  revalidatePath("/finanzas");
  return { success: true };
}

export async function deleteIncomeSource(sourceId: string): Promise<void> {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  await supabase
    .from("income_sources")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
    .eq("id", sourceId)
    .eq("household_id", householdId);

  revalidatePath("/finanzas");
}
