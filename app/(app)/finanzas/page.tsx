import { format } from "date-fns";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ensureCurrentMonthPaymentInstances } from "@/app/(app)/finanzas/actions";
import { FinanceTabs } from "@/components/finance/FinanceTabs";
import { getCurrentCycleDates, getCycleLabel, getSubscriptionCycleStatus } from "@/lib/cycle";

export default async function FinancePage() {
  const { householdId } = await requireHousehold();

  await ensureCurrentMonthPaymentInstances(householdId);

  const supabase = await createClient();
  const now = new Date();
  const { start: cycleStartDate, end: cycleEndDate } = getCurrentCycleDates();
  const cycleStart = format(cycleStartDate, "yyyy-MM-dd");
  const cycleEnd = format(cycleEndDate, "yyyy-MM-dd");
  const cycleLabel = getCycleLabel();

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
    { data: incomeSources },
    { data: categoryBudgets },
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
    supabase.from("households").select("monthly_budget, current_balance").eq("id", householdId).single(),
    supabase
      .from("income_sources")
      .select("*")
      .eq("household_id", householdId)
      .is("deleted_at", null)
      .order("earner_name", { ascending: true }),
    supabase
      .from("category_budgets")
      .select("*")
      .eq("household_id", householdId),
  ]);

  const allInstances = paymentInstances ?? [];
  const thisCycleInstances = allInstances.filter((i) => i.due_date >= cycleStart && i.due_date <= cycleEnd);

  // Derive effective status for each active fixed payment using cycle-aware logic.
  // DB "pagado"/"omitido" is authoritative; for everything else, infer from due_day.
  const instanceByCyclePaymentId = new Map(thisCycleInstances.map((i) => [i.fixed_payment_id, i]));
  const activeFixedPayments = (fixedPayments ?? []).filter((p) => p.is_active);

  function derivedFixedStatus(payment: { due_day: number | null; id: string }): "pagado" | "pendiente" | "omitido" {
    const inst = instanceByCyclePaymentId.get(payment.id);
    if (inst?.status === "pagado") return "pagado";
    if (inst?.status === "omitido") return "omitido";
    if (payment.due_day != null) return getSubscriptionCycleStatus(payment.due_day, now);
    return "pendiente";
  }

  const fixedWithStatus = activeFixedPayments.map((p) => ({
    amount: Number(p.amount),
    status: derivedFixedStatus(p),
  }));

  const paidThisMonthTotal = fixedWithStatus
    .filter((d) => d.status === "pagado")
    .reduce((sum, d) => sum + d.amount, 0);
  const pendingThisMonthTotal = fixedWithStatus
    .filter((d) => d.status === "pendiente")
    .reduce((sum, d) => sum + d.amount, 0);
  // Total expected fixed outflow this cycle (sum of all active payment amounts)
  const totalFixedThisMonth = activeFixedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  // Overdue = only instances explicitly marked "vencido" (not inferred from date)
  const overdueCount = thisCycleInstances.filter((i) => i.status === "vencido").length;

  const expensesThisMonthTotal = (expenses ?? [])
    .filter((e) => e.expense_date >= cycleStart && e.expense_date <= cycleEnd)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const activeSubs = (subscriptions ?? []).filter((s) => s.is_active);
  const activeMonthlySubsWithDay = activeSubs.filter(
    (s) =>
      s.billing_cycle === "mensual" &&
      s.billing_day != null &&
      !(s.start_date && new Date(s.start_date) > now),
  );
  const monthlySubscriptionsTotal = activeSubs
    .filter((s) => s.billing_cycle === "mensual")
    .reduce((sum, s) => sum + Number(s.amount), 0);
  const annualSubscriptionsTotal = activeSubs
    .filter((s) => s.billing_cycle === "anual")
    .reduce((sum, s) => sum + Number(s.amount), 0);

  // Monthly sub paid/pending split (cycle-derived)
  const paidSubsThisMonthTotal = activeMonthlySubsWithDay
    .filter((s) => getSubscriptionCycleStatus(s.billing_day!, now) === "pagado")
    .reduce((sum, s) => sum + Number(s.amount), 0);
  const pendingSubsThisMonthTotal = activeMonthlySubsWithDay
    .filter((s) => getSubscriptionCycleStatus(s.billing_day!, now) === "pendiente")
    .reduce((sum, s) => sum + Number(s.amount), 0);

  // Upcoming = pending fixed payments + monthly subs whose billing_day hasn't passed yet
  const pendingFixedCount = fixedWithStatus.filter((d) => d.status === "pendiente").length;
  const pendingSubsCount = activeMonthlySubsWithDay.filter(
    (s) => getSubscriptionCycleStatus(s.billing_day!, now) === "pendiente",
  ).length;
  const upcomingCount = pendingFixedCount + pendingSubsCount;

  const goalsWithTarget = (savingsGoals ?? []).filter((g) => Number(g.target_amount) > 0);
  const savingsProgressPct =
    goalsWithTarget.length > 0
      ? (goalsWithTarget.reduce((sum, g) => sum + Number(g.current_amount) / Number(g.target_amount), 0) /
          goalsWithTarget.length) *
        100
      : null;

  const totalMonthlyIncome = (incomeSources ?? [])
    .filter((s) => s.is_active)
    .reduce((sum, s) => {
      const amt = Number(s.amount);
      if (s.frequency === "anual") return sum + amt / 12;
      if (s.frequency === "trimestral") return sum + amt / 3;
      return sum + amt;
    }, 0);

  const accountBalance = householdRow?.current_balance ?? null;

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
        paidSubsThisMonthTotal,
        pendingSubsThisMonthTotal,
        savingsProgressPct,
        monthlyBudget: householdRow?.monthly_budget ?? null,
        totalMonthlyIncome,
        accountBalance,
      }}
      fixedPayments={fixedPayments ?? []}
      paymentInstances={thisCycleInstances}
      expenses={expenses ?? []}
      savingsGoals={savingsGoals ?? []}
      subscriptions={subscriptions ?? []}
      mortgages={mortgages ?? []}
      mortgagePayments={mortgagePayments ?? []}
      financeCategories={financeCategories ?? []}
      members={members ?? []}
      incomeSources={incomeSources ?? []}
      categoryBudgets={categoryBudgets ?? []}
      cycleLabel={cycleLabel}
      cycleStart={cycleStart}
      cycleEnd={cycleEnd}
    />
  );
}
