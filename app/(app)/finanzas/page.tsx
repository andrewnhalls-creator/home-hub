import { format, startOfMonth, endOfMonth } from "date-fns";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ensureCurrentMonthPaymentInstances } from "@/app/(app)/finanzas/actions";
import { FinanceTabs } from "@/components/finance/FinanceTabs";
import { TrashSection } from "@/components/ui/TrashSection";
import {
  restoreFixedPayment,
  restoreExpense,
  restoreSavingsGoal,
  restoreSubscription,
} from "./actions";

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
    { data: financeCategories },
    { data: members },
    { data: deletedFixed },
    { data: deletedExpenses },
    { data: deletedGoals },
    { data: deletedSubs },
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
      .from("categories")
      .select("*")
      .eq("household_id", householdId)
      .eq("module", "finance")
      .order("name", { ascending: true }),
    supabase.from("household_members").select("user_id, display_name").eq("household_id", householdId),
    supabase
      .from("fixed_payments")
      .select("id, name, deleted_at")
      .eq("household_id", householdId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
    supabase
      .from("expenses")
      .select("id, title, expense_date, deleted_at")
      .eq("household_id", householdId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
    supabase
      .from("savings_goals")
      .select("id, name, deleted_at")
      .eq("household_id", householdId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("id, name, deleted_at")
      .eq("household_id", householdId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
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

  const activeSubscriptionsTotal = (subscriptions ?? [])
    .filter((s) => s.is_active)
    .reduce((sum, s) => sum + Number(s.amount), 0);

  const goalsWithTarget = (savingsGoals ?? []).filter((g) => Number(g.target_amount) > 0);
  const savingsProgressPct =
    goalsWithTarget.length > 0
      ? (goalsWithTarget.reduce((sum, g) => sum + Number(g.current_amount) / Number(g.target_amount), 0) /
          goalsWithTarget.length) *
        100
      : null;

  const fixedTrash = (deletedFixed ?? []).map((r) => ({
    id: r.id,
    label: r.name,
    deletedAt: r.deleted_at as string,
  }));
  const expenseTrash = (deletedExpenses ?? []).map((r) => ({
    id: r.id,
    label: r.title ?? "Gasto",
    sublabel: r.expense_date
      ? new Date(r.expense_date).toLocaleDateString("es-ES")
      : undefined,
    deletedAt: r.deleted_at as string,
  }));
  const goalsTrash = (deletedGoals ?? []).map((r) => ({
    id: r.id,
    label: r.name,
    deletedAt: r.deleted_at as string,
  }));
  const subsTrash = (deletedSubs ?? []).map((r) => ({
    id: r.id,
    label: r.name,
    deletedAt: r.deleted_at as string,
  }));

  return (
    <>
      <FinanceTabs
        resumen={{
          upcomingCount,
          overdueCount,
          paidThisMonthTotal,
          pendingThisMonthTotal,
          totalFixedThisMonth,
          expensesThisMonthTotal,
          activeSubscriptionsTotal,
          savingsProgressPct,
        }}
        fixedPayments={fixedPayments ?? []}
        paymentInstances={thisMonthInstances}
        expenses={expenses ?? []}
        savingsGoals={savingsGoals ?? []}
        subscriptions={subscriptions ?? []}
        financeCategories={financeCategories ?? []}
        members={members ?? []}
      />
      <details className="group mt-2 mb-6">
        <summary className="cursor-pointer list-none rounded-xl px-3 py-2 text-xs font-medium text-muted hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta">
          <span className="group-open:hidden">▸ Archivo y papelera</span>
          <span className="hidden group-open:inline">▾ Archivo y papelera</span>
        </summary>
        <div className="mt-2">
          <TrashSection
            title="Papelera — Pagos fijos"
            items={fixedTrash}
            restoreAction={restoreFixedPayment}
            emptyMessage="No hay pagos fijos eliminados"
          />
          <TrashSection
            title="Papelera — Gastos"
            items={expenseTrash}
            restoreAction={restoreExpense}
            emptyMessage="No hay gastos eliminados"
          />
          <TrashSection
            title="Papelera — Objetivos de ahorro"
            items={goalsTrash}
            restoreAction={restoreSavingsGoal}
            emptyMessage="No hay objetivos eliminados"
          />
          <TrashSection
            title="Papelera — Suscripciones"
            items={subsTrash}
            restoreAction={restoreSubscription}
            emptyMessage="No hay suscripciones eliminadas"
          />
        </div>
      </details>
    </>
  );
}
