"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { incomeSourceSchema } from "@/lib/validations/finance";
import { logActivity } from "@/lib/activity";

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
    recurrenceMonths: formData.getAll("recurrenceMonths"),
    categoryId: formData.get("categoryId") || undefined,
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
    recurrence_months: parsed.data.recurrenceMonths?.length ? parsed.data.recurrenceMonths : null,
    category_id: parsed.data.categoryId || null,
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
    recurrenceMonths: formData.getAll("recurrenceMonths"),
    categoryId: formData.get("categoryId") || undefined,
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
      recurrence_months: parsed.data.recurrenceMonths?.length ? parsed.data.recurrenceMonths : null,
      category_id: parsed.data.categoryId || null,
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

// ---------------------------------------------------------------------------
// Income receipts: marking an occurrence as received creates the money-in
// movement (ledger type 'income' via trigger). One receipt per source+month;
// the receipt's amount is the ACTUAL amount (template keeps the expected).
// ---------------------------------------------------------------------------

export async function markIncomeReceived(
  _prevState: IncomeFormState,
  formData: FormData,
): Promise<IncomeFormState> {
  const sourceId = formData.get("sourceId") as string;
  const amountRaw = formData.get("amount");
  const receivedOn = (formData.get("receivedOn") as string) || null;
  const bankAccount = (formData.get("bankAccount") as string) || null;

  const amount = Number(amountRaw);
  if (!sourceId || !Number.isFinite(amount) || amount < 0) {
    return { error: "Introduce un importe válido." };
  }

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: source } = await supabase
    .from("income_sources")
    .select("name, bank_account")
    .eq("id", sourceId)
    .eq("household_id", householdId)
    .single();
  if (!source) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  const date =
    receivedOn || new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
  const occurrenceKey = date.slice(0, 7); // YYYY-MM: one receipt per month

  const { error } = await supabase.from("income_receipts").upsert(
    {
      household_id: householdId,
      income_source_id: sourceId,
      occurrence_key: occurrenceKey,
      received_on: date,
      amount,
      bank_account: bankAccount || source.bank_account,
      created_by: user.id,
    },
    { onConflict: "income_source_id,occurrence_key" },
  );

  if (error) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  // No amount in the summary (privacy rule).
  void logActivity({ householdId, actorId: user.id, entityType: "income_receipt", entityId: sourceId, action: "received", summary: `Marcó como recibido: ${source.name}` });

  revalidatePath("/finanzas");
  return { success: true };
}

export async function unmarkIncomeReceived(receiptId: string): Promise<void> {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();
  await supabase
    .from("income_receipts")
    .delete()
    .eq("id", receiptId)
    .eq("household_id", householdId);
  revalidatePath("/finanzas");
}
