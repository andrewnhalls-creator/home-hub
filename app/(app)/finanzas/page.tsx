import { format, startOfMonth, endOfMonth } from "date-fns";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ensureCurrentMonthPaymentInstances } from "@/app/(app)/finanzas/actions";
import { FinanceTabs } from "@/components/finance/FinanceTabs";

export default async function FinancePage() {
  const { householdId } = await requireHousehold();

  await ensureCurrentMonthPaymentInstances(householdId);

  const supabase = await createClient();
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");
  const todayStr = format(now, "yyyy-MM-dd");

  const [
    { data: fixedPayments },
    { data: paymentInstances },
    { data: expenses },
    { data: savingsGoals },
    { data: subscriptions },
    { data: mortgages },
    { data: mortgagePayments },
    { data: financeCategories },
    { data: members },
    { data: householdRow },
  ] = await Promise.all([
    supabase
      .from("fixed_payments")
      .select("*")
      .eq("household_id", householdId)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase.from("payment_instances").select("*").eq("household_id", householdId),
    supabase
      .from("expenses")
      .select("*")
      .eq("household_id", householdId)
      .is("deleted_at", null)
      .order("expense_date", { ascending: false }),
    supabase
      .from("savings_goals")
      .select("*")
      .eq("household_id", householdId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("household_id", householdId)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("mortgages")
      .select("*")
      .eq("household_id", householdId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("mortgage_payments")
      .select("*")
      .eq("household_id", householdId)
      .order("due_date", { ascending: false }),
    supabase
      .from("categories")
      .select("*")
      .eq("household_id", householdId)
      .eq("module", "finance")
      .order("name", { ascending: true }),
    supabase.from("household_members").select("user_id, display_name").eq("household_id", householdId),
    supabase.from("households").select("monthly_budget").eq("id", householdId).single(),
  ]);

  const allInstances = paymentInstances ?? [];
  const thisMonthInstances = allInstances.filter((i) => i.due_date >= monthStart && i.due_date <= monthEnd);

  const upcomingCount = allInstances.filter((i) => i.status === "pendiente" && i.due_date >= todayStr).length;
  const overdueCount = allInstances.filter((i) => i.status === "pendiente" && i.due_date < todayStr).length;
  const paidThisMonthTotal = thisMonthInstances
    .filter((i) => i.status === "pagado")
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const pendingThisMonthTotal = thisMonthInstances
    .filter((i) => i.status === "pendiente")
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const totalFixedThisMonth = thisMonthInstances.reduce((sum, i) => sum + Number(i.amount), 0);

  const expensesThisMonthTotal = (expenses ?? [])
    .filter((e) => e.expense_date >= monthStart && e.expense_date <= monthEnd)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const activeSubs = (subscriptions ?? []).filter((s) => s.is_active);
  const monthlySubscriptionsTotal = activeSubs
    .filter((s) => s.billing_cycle === "mensual")
    .reduce((sum, s) => sum + Number(s.amount), 0);
  const annualSubscriptionsTotal = activeSubs
    .filter((s) => s.billing_cycle === "anual")
    .reduce((sum, s) => sum + Number(s.amount), 0);

  const goalsWithTarget = (savingsGoals ?? []).filter((g) => Number(g.target_amount) > 0);
  const savingsProgressPct =
    goalsWithTarget.length > 0
      ? (goalsWithTarget.reduce((sum, g) => sum + Number(g.current_amount) / Number(g.target_amount), 0) /
          goalsWithTarget.length) *
        100
      : null;

  return (
    <FinanceTabs
      resumen={{
        upcomingCount,
        overdueCount,
        paidThisMonthTotal,
        pendingThisMonthTotal,
        totalFixedThisMonth,
        expensesThisMonthTotal,
        monthlySubscriptionsTotal,
        annualSubscriptionsTotal,
        savingsProgressPct,
        monthlyBudget: householdRow?.monthly_budget ?? null,
      }}
      fixedPayments={fixedPayments ?? []}
      paymentInstances={thisMonthInstances}
      expenses={expenses ?? []}
      savingsGoals={savingsGoals ?? []}
      subscriptions={subscriptions ?? []}
      mortgages={mortgages ?? []}
      mortgagePayments={mortgagePayments ?? []}
      financeCategories={financeCategories ?? []}
      members={members ?? []}
    />
  );
}
