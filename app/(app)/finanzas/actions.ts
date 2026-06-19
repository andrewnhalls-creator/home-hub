"use server";

import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import {
  fixedPaymentSchema,
  expenseSchema,
  savingsGoalSchema,
  contributionSchema,
  subscriptionSchema,
} from "@/lib/validations/finance";
import { upsertScheduledNotification, cancelScheduledNotifications } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";
import { getCurrentCycleDates, getCycleDueDate } from "@/lib/cycle";

export interface FinanceFormState {
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

// ---------------------------------------------------------------------------
// Fixed payments + payment instances
// ---------------------------------------------------------------------------

export async function createFixedPayment(
  _prevState: FinanceFormState,
  formData: FormData,
): Promise<FinanceFormState> {
  const parsed = fixedPaymentSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    categoryId: formData.get("categoryId") || undefined,
    dueDay: formData.get("dueDay") || undefined,
    paymentMethod: formData.get("paymentMethod") || undefined,
    isActive: formData.get("isActive") === "on",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase.from("fixed_payments").insert({
    household_id: householdId,
    name: parsed.data.name,
    amount: parsed.data.amount,
    category_id: parsed.data.categoryId || null,
    due_day: parsed.data.dueDay === "" ? null : parsed.data.dueDay,
    payment_method: parsed.data.paymentMethod || null,
    is_active: parsed.data.isActive,
    notes: parsed.data.notes || null,
    created_by: user.id,
  });

  if (error) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  void logActivity({ householdId, actorId: user.id, entityType: "fixed_payment", action: "created", summary: `Añadió el pago fijo: ${parsed.data.name}` });

  revalidatePath("/finanzas");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateFixedPayment(
  paymentId: string,
  _prevState: FinanceFormState,
  formData: FormData,
): Promise<FinanceFormState> {
  const parsed = fixedPaymentSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    categoryId: formData.get("categoryId") || undefined,
    dueDay: formData.get("dueDay") || undefined,
    paymentMethod: formData.get("paymentMethod") || undefined,
    isActive: formData.get("isActive") === "on",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase
    .from("fixed_payments")
    .update({
      name: parsed.data.name,
      amount: parsed.data.amount,
      category_id: parsed.data.categoryId || null,
      due_day: parsed.data.dueDay === "" ? null : parsed.data.dueDay,
      payment_method: parsed.data.paymentMethod || null,
      is_active: parsed.data.isActive,
      notes: parsed.data.notes || null,
    })
    .eq("id", paymentId)
    .eq("household_id", householdId);

  if (error) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  revalidatePath("/finanzas");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteFixedPayment(paymentId: string) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: payment } = await supabase.from("fixed_payments").select("name").eq("id", paymentId).single();

  await supabase
    .from("fixed_payments")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
    .eq("id", paymentId)
    .eq("household_id", householdId);

  void logActivity({ householdId, actorId: user.id, entityType: "fixed_payment", entityId: paymentId, action: "deleted", summary: `Eliminó el pago fijo: ${payment?.name ?? paymentId}` });

  revalidatePath("/finanzas");
  revalidatePath("/dashboard");
}

export async function restoreFixedPayment(
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const paymentId = formData.get("id") as string;
  const { householdId } = await requireHousehold();
  const supabase = await createClient();
  const { error } = await supabase.from("fixed_payments").update({ deleted_at: null, deleted_by: null }).eq("id", paymentId).eq("household_id", householdId);
  if (error) return { error: "No se ha podido restaurar." };
  revalidatePath("/finanzas");
  revalidatePath("/dashboard");
  return {};
}

/**
 * Ensures every active fixed payment has a payment_instances row for the
 * current 25-to-25 cycle. Uses cycle-aware due dates: payments with
 * due_day >= 25 fall in the previous calendar month; due_day < 25 fall in
 * the current calendar month. Idempotent — safe to call on every page load.
 */
export async function ensureCurrentMonthPaymentInstances(householdId: string) {
  const supabase = await createClient();
  const now = new Date();
  const { start: cycleStartDate, end: cycleEndDate } = getCurrentCycleDates();
  const cycleStart = format(cycleStartDate, "yyyy-MM-dd");
  const cycleEnd = format(cycleEndDate, "yyyy-MM-dd");

  const { data: activePayments } = await supabase
    .from("fixed_payments")
    .select("id, name, amount, currency, due_day")
    .eq("household_id", householdId)
    .eq("is_active", true)
    .is("deleted_at", null);

  if (!activePayments || activePayments.length === 0) return;

  // Deduplicate against existing instances within the cycle date range
  const { data: existingInstances } = await supabase
    .from("payment_instances")
    .select("fixed_payment_id")
    .eq("household_id", householdId)
    .gte("due_date", cycleStart)
    .lte("due_date", cycleEnd);

  const existingIds = new Set((existingInstances ?? []).map((i) => i.fixed_payment_id));

  const paymentsToCreate = activePayments.filter((payment) => !existingIds.has(payment.id));
  if (paymentsToCreate.length === 0) return;

  const toCreate = paymentsToCreate.map((payment) => {
    // Cycle-aware: day >= 25 → previous calendar month, day < 25 → current calendar month
    const dueDay = payment.due_day ?? 1;
    const dueDate = format(getCycleDueDate(dueDay, now), "yyyy-MM-dd");
    return {
      household_id: householdId,
      fixed_payment_id: payment.id,
      due_date: dueDate,
      amount: payment.amount,
      currency: payment.currency,
    };
  });

  const { data: createdInstances } = await supabase
    .from("payment_instances")
    .insert(toCreate)
    .select("id, fixed_payment_id, due_date");

  for (const instance of createdInstances ?? []) {
    const payment = paymentsToCreate.find((p) => p.id === instance.fixed_payment_id);
    if (!payment) continue;
    await schedulePaymentInstanceNotification(instance.id, householdId, payment.name, instance.due_date);
  }
}

export async function markPaymentInstancePaid(instanceId: string) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  await supabase
    .from("payment_instances")
    .update({ status: "pagado", paid_date: format(new Date(), "yyyy-MM-dd"), paid_by: user.id })
    .eq("id", instanceId)
    .eq("household_id", householdId);

  await cancelScheduledNotifications("payment_instance", instanceId);

  revalidatePath("/finanzas");
  revalidatePath("/dashboard");
}

export async function skipPaymentInstance(instanceId: string) {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  await supabase
    .from("payment_instances")
    .update({ status: "omitido" })
    .eq("id", instanceId)
    .eq("household_id", householdId);

  await cancelScheduledNotifications("payment_instance", instanceId);

  revalidatePath("/finanzas");
  revalidatePath("/dashboard");
}

export async function overridePaymentInstanceAmount(instanceId: string, amount: number) {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  await supabase
    .from("payment_instances")
    .update({ amount })
    .eq("id", instanceId)
    .eq("household_id", householdId);

  revalidatePath("/finanzas");
}

export async function schedulePaymentInstanceNotification(
  instanceId: string,
  householdId: string,
  title: string,
  dueDate: string,
) {
  await upsertScheduledNotification({
    householdId,
    userId: null,
    category: "pagos",
    entityType: "payment_instance",
    entityId: instanceId,
    scheduledFor: new Date(`${dueDate}T09:00:00`).toISOString(),
    title: "Tienes un pago próximo",
    body: title,
  });
}

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

export async function createExpense(
  _prevState: FinanceFormState,
  formData: FormData,
): Promise<FinanceFormState> {
  const parsed = expenseSchema.safeParse({
    title: formData.get("title"),
    amount: formData.get("amount"),
    expenseDate: formData.get("expenseDate"),
    categoryId: formData.get("categoryId") || undefined,
    paidBy: formData.get("paidBy") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase.from("expenses").insert({
    household_id: householdId,
    title: parsed.data.title,
    amount: parsed.data.amount,
    expense_date: parsed.data.expenseDate,
    category_id: parsed.data.categoryId || null,
    paid_by: parsed.data.paidBy || null,
    notes: parsed.data.notes || null,
    created_by: user.id,
  });

  if (error) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  void logActivity({ householdId, actorId: user.id, entityType: "expense", action: "created", summary: `Añadió un gasto: ${parsed.data.title}` });

  revalidatePath("/finanzas");
  return { success: true };
}

export async function deleteExpense(expenseId: string) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: expense } = await supabase.from("expenses").select("title").eq("id", expenseId).single();

  await supabase
    .from("expenses")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
    .eq("id", expenseId)
    .eq("household_id", householdId);

  void logActivity({ householdId, actorId: user.id, entityType: "expense", entityId: expenseId, action: "deleted", summary: `Eliminó el gasto: ${expense?.title ?? expenseId}` });

  revalidatePath("/finanzas");
}

export async function restoreExpense(
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const expenseId = formData.get("id") as string;
  const { householdId } = await requireHousehold();
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").update({ deleted_at: null, deleted_by: null }).eq("id", expenseId).eq("household_id", householdId);
  if (error) return { error: "No se ha podido restaurar." };
  revalidatePath("/finanzas");
  return {};
}

// ---------------------------------------------------------------------------
// Savings goals + contributions
// ---------------------------------------------------------------------------

export async function createSavingsGoal(
  _prevState: FinanceFormState,
  formData: FormData,
): Promise<FinanceFormState> {
  const parsed = savingsGoalSchema.safeParse({
    name: formData.get("name"),
    targetAmount: formData.get("targetAmount"),
    targetDate: formData.get("targetDate") || undefined,
    priority: formData.get("priority") || "normal",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase.from("savings_goals").insert({
    household_id: householdId,
    name: parsed.data.name,
    target_amount: parsed.data.targetAmount,
    target_date: parsed.data.targetDate || null,
    priority: parsed.data.priority,
    notes: parsed.data.notes || null,
    created_by: user.id,
  });

  if (error) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  void logActivity({ householdId, actorId: user.id, entityType: "savings_goal", action: "created", summary: `Creó la meta de ahorro: ${parsed.data.name}` });

  revalidatePath("/finanzas");
  return { success: true };
}

export async function deleteSavingsGoal(goalId: string) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: goal } = await supabase.from("savings_goals").select("name").eq("id", goalId).single();

  await supabase
    .from("savings_goals")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
    .eq("id", goalId)
    .eq("household_id", householdId);

  void logActivity({ householdId, actorId: user.id, entityType: "savings_goal", entityId: goalId, action: "deleted", summary: `Eliminó la meta de ahorro: ${goal?.name ?? goalId}` });

  revalidatePath("/finanzas");
}

export async function restoreSavingsGoal(
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const goalId = formData.get("id") as string;
  const { householdId } = await requireHousehold();
  const supabase = await createClient();
  const { error } = await supabase.from("savings_goals").update({ deleted_at: null, deleted_by: null }).eq("id", goalId).eq("household_id", householdId);
  if (error) return { error: "No se ha podido restaurar." };
  revalidatePath("/finanzas");
  return {};
}

export async function addContribution(
  goalId: string,
  _prevState: FinanceFormState,
  formData: FormData,
): Promise<FinanceFormState> {
  const parsed = contributionSchema.safeParse({
    amount: formData.get("amount"),
    contributionDate: formData.get("contributionDate") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: goal } = await supabase
    .from("savings_goals")
    .select("current_amount")
    .eq("id", goalId)
    .eq("household_id", householdId)
    .single();

  if (!goal) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  const { error: contribError } = await supabase.from("savings_contributions").insert({
    goal_id: goalId,
    amount: parsed.data.amount,
    contribution_date: parsed.data.contributionDate || undefined,
    contributed_by: user.id,
    notes: parsed.data.notes || null,
  });

  if (contribError) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  await supabase
    .from("savings_goals")
    .update({ current_amount: Number(goal.current_amount) + parsed.data.amount })
    .eq("id", goalId)
    .eq("household_id", householdId);

  revalidatePath("/finanzas");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------

export async function createSubscription(
  _prevState: FinanceFormState,
  formData: FormData,
): Promise<FinanceFormState> {
  const parsed = subscriptionSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    billingCycle: formData.get("billingCycle") || "mensual",
    renewalDate: formData.get("renewalDate") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    isActive: formData.get("isActive") === "on",
    notes: formData.get("notes") || undefined,
    billingDay: formData.get("billingDay") || undefined,
    billingIntervalDays: formData.get("billingIntervalDays") || undefined,
    lastPaymentDate: formData.get("lastPaymentDate") || undefined,
    startDate: formData.get("startDate") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      household_id: householdId,
      name: parsed.data.name,
      amount: parsed.data.amount,
      billing_cycle: parsed.data.billingCycle,
      billing_day: parsed.data.billingDay === "" ? null : (parsed.data.billingDay ?? null),
      billing_interval_days: parsed.data.billingIntervalDays === "" ? null : (parsed.data.billingIntervalDays ?? null),
      last_payment_date: parsed.data.lastPaymentDate || null,
      start_date: parsed.data.startDate || null,
      renewal_date: parsed.data.renewalDate || null,
      category_id: parsed.data.categoryId || null,
      is_active: parsed.data.isActive,
      notes: parsed.data.notes || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  if (parsed.data.renewalDate) {
    await upsertScheduledNotification({
      householdId,
      userId: null,
      category: "suscripciones",
      entityType: "subscription",
      entityId: data.id,
      scheduledFor: new Date(`${parsed.data.renewalDate}T09:00:00`).toISOString(),
      title: "Tienes una suscripción próxima a renovar",
      body: parsed.data.name,
    });
  }

  void logActivity({ householdId, actorId: user.id, entityType: "subscription", entityId: data.id, action: "created", summary: `Añadió la suscripción: ${parsed.data.name}` });

  revalidatePath("/finanzas");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteSubscription(subscriptionId: string) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: sub } = await supabase.from("subscriptions").select("name").eq("id", subscriptionId).single();

  await supabase
    .from("subscriptions")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
    .eq("id", subscriptionId)
    .eq("household_id", householdId);

  await cancelScheduledNotifications("subscription", subscriptionId);
  void logActivity({ householdId, actorId: user.id, entityType: "subscription", entityId: subscriptionId, action: "deleted", summary: `Eliminó la suscripción: ${sub?.name ?? subscriptionId}` });

  revalidatePath("/finanzas");
  revalidatePath("/dashboard");
}

export async function restoreSubscription(
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const subscriptionId = formData.get("id") as string;
  const { householdId } = await requireHousehold();
  const supabase = await createClient();
  const { error } = await supabase.from("subscriptions").update({ deleted_at: null, deleted_by: null }).eq("id", subscriptionId).eq("household_id", householdId);
  if (error) return { error: "No se ha podido restaurar." };
  revalidatePath("/finanzas");
  revalidatePath("/dashboard");
  return {};
}

export async function updateSubscription(
  subscriptionId: string,
  _prevState: FinanceFormState,
  formData: FormData,
): Promise<FinanceFormState> {
  const parsed = subscriptionSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    billingCycle: formData.get("billingCycle") || "mensual",
    renewalDate: formData.get("renewalDate") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    isActive: formData.get("isActive") === "on",
    notes: formData.get("notes") || undefined,
    billingDay: formData.get("billingDay") || undefined,
    billingIntervalDays: formData.get("billingIntervalDays") || undefined,
    lastPaymentDate: formData.get("lastPaymentDate") || undefined,
    startDate: formData.get("startDate") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase
    .from("subscriptions")
    .update({
      name: parsed.data.name,
      amount: parsed.data.amount,
      billing_cycle: parsed.data.billingCycle,
      billing_day: parsed.data.billingDay === "" ? null : (parsed.data.billingDay ?? null),
      billing_interval_days: parsed.data.billingIntervalDays === "" ? null : (parsed.data.billingIntervalDays ?? null),
      last_payment_date: parsed.data.lastPaymentDate || null,
      start_date: parsed.data.startDate || null,
      renewal_date: parsed.data.renewalDate || null,
      category_id: parsed.data.categoryId || null,
      is_active: parsed.data.isActive,
      notes: parsed.data.notes || null,
    })
    .eq("id", subscriptionId)
    .eq("household_id", householdId);

  if (error) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  if (parsed.data.renewalDate) {
    await upsertScheduledNotification({
      householdId,
      userId: null,
      category: "suscripciones",
      entityType: "subscription",
      entityId: subscriptionId,
      scheduledFor: new Date(`${parsed.data.renewalDate}T09:00:00`).toISOString(),
      title: "Tienes una suscripción próxima a renovar",
      body: parsed.data.name,
    });
  }

  void logActivity({ householdId, actorId: user.id, entityType: "subscription", entityId: subscriptionId, action: "updated", summary: `Editó la suscripción: ${parsed.data.name}` });

  revalidatePath("/finanzas");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateHouseholdBalance(
  _prevState: { error?: string; success?: boolean },
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const raw = String(formData.get("balance") ?? "").replace(",", ".");
  const balance = parseFloat(raw);
  if (isNaN(balance) || balance < 0) return { error: "Introduce un saldo válido." };
  const { householdId } = await requireHousehold();
  const supabase = await createClient();
  const { error } = await supabase
    .from("households")
    .update({ current_balance: balance })
    .eq("id", householdId);
  if (error) return { error: "No se ha podido guardar el saldo." };
  revalidatePath("/finanzas");
  return { success: true };
}

export async function updateMonthlyBudget(amount: number | null): Promise<{ error?: string }> {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();
  const { error } = await supabase
    .from("households")
    .update({ monthly_budget: amount })
    .eq("id", householdId);
  if (error) return { error: "No se ha podido guardar el presupuesto." };
  revalidatePath("/finanzas");
  return {};
}
