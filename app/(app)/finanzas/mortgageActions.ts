"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { mortgageSchema, mortgagePaymentSchema } from "@/lib/validations/finance";

export interface MortgageFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

function flattenFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

// ─── Mortgage ────────────────────────────────────────────────────────────────

export async function upsertMortgage(
  _prevState: MortgageFormState,
  formData: FormData,
): Promise<MortgageFormState> {
  const parsed = mortgageSchema.safeParse({
    name: formData.get("name"),
    lender: formData.get("lender") || undefined,
    originalPrincipal: formData.get("originalPrincipal"),
    currentBalance: formData.get("currentBalance"),
    monthlyPayment: formData.get("monthlyPayment"),
    interestRate: formData.get("interestRate") || undefined,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
    paymentDay: formData.get("paymentDay") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();
  const mortgageId = formData.get("id") as string | null;

  const payload = {
    household_id: householdId,
    name: parsed.data.name,
    lender: parsed.data.lender || null,
    original_principal: parsed.data.originalPrincipal,
    current_balance: parsed.data.currentBalance,
    monthly_payment: parsed.data.monthlyPayment,
    interest_rate: parsed.data.interestRate || null,
    start_date: parsed.data.startDate || null,
    end_date: parsed.data.endDate || null,
    payment_day: parsed.data.paymentDay || null,
    notes: parsed.data.notes || null,
  };

  if (mortgageId) {
    const { error } = await supabase
      .from("mortgages")
      .update(payload)
      .eq("id", mortgageId)
      .eq("household_id", householdId);
    if (error) return { error: "No se pudo actualizar la hipoteca." };
  } else {
    const { error } = await supabase.from("mortgages").insert({ ...payload, created_by: user.id });
    if (error) return { error: "No se pudo guardar la hipoteca." };
  }

  revalidatePath("/finanzas");
  return { success: true };
}

export async function deleteMortgage(id: string): Promise<{ error?: string }> {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();
  const { error } = await supabase
    .from("mortgages")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
    .eq("id", id)
    .eq("household_id", householdId);
  if (error) return { error: "No se pudo eliminar la hipoteca." };
  revalidatePath("/finanzas");
  return {};
}

// ─── Mortgage payments ────────────────────────────────────────────────────────

export async function addMortgagePayment(
  _prevState: MortgageFormState,
  formData: FormData,
): Promise<MortgageFormState> {
  const parsed = mortgagePaymentSchema.safeParse({
    mortgageId: formData.get("mortgageId"),
    dueDate: formData.get("dueDate"),
    paidDate: formData.get("paidDate") || undefined,
    amount: formData.get("amount"),
    principalAmount: formData.get("principalAmount") || undefined,
    interestAmount: formData.get("interestAmount") || undefined,
    extraPayment: formData.get("extraPayment") || undefined,
    status: formData.get("status") || "pendiente",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase.from("mortgage_payments").insert({
    household_id: householdId,
    mortgage_id: parsed.data.mortgageId,
    due_date: parsed.data.dueDate,
    paid_date: parsed.data.paidDate || null,
    amount: parsed.data.amount,
    principal_amount: parsed.data.principalAmount || null,
    interest_amount: parsed.data.interestAmount || null,
    extra_payment: parsed.data.extraPayment || 0,
    status: parsed.data.status,
    paid_by: parsed.data.status === "pagado" ? user.id : null,
    notes: parsed.data.notes || null,
    created_by: user.id,
  });

  if (error) return { error: "No se pudo registrar el pago." };

  revalidatePath("/finanzas");
  return { success: true };
}

export async function markMortgagePaymentPaid(paymentId: string): Promise<{ error?: string }> {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();
  const { error } = await supabase
    .from("mortgage_payments")
    .update({ status: "pagado", paid_date: new Date().toISOString().slice(0, 10), paid_by: user.id })
    .eq("id", paymentId)
    .eq("household_id", householdId);
  if (error) return { error: "No se pudo marcar el pago." };
  revalidatePath("/finanzas");
  return {};
}

export async function deleteMortgagePayment(paymentId: string): Promise<{ error?: string }> {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();
  const { error } = await supabase
    .from("mortgage_payments")
    .delete()
    .eq("id", paymentId)
    .eq("household_id", householdId);
  if (error) return { error: "No se pudo eliminar el pago." };
  revalidatePath("/finanzas");
  return {};
}
