"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ResumenTab } from "@/components/finance/ResumenTab";
import { FixedPaymentsTab } from "@/components/finance/FixedPaymentsTab";
import { ExpensesTab } from "@/components/finance/ExpensesTab";
import { SavingsTab } from "@/components/finance/SavingsTab";
import { SubscriptionsTab } from "@/components/finance/SubscriptionsTab";
import type { Category, Expense, FixedPayment, PaymentInstance, SavingsGoal, Subscription } from "@/lib/types";

interface Member {
  user_id: string;
  display_name: string | null;
}

interface FinanceTabsProps {
  resumen: {
    upcomingCount: number;
    overdueCount: number;
    paidThisMonthTotal: number;
    pendingThisMonthTotal: number;
    totalFixedThisMonth: number;
    expensesThisMonthTotal: number;
    activeSubscriptionsTotal: number;
    savingsProgressPct: number | null;
  };
  fixedPayments: FixedPayment[];
  paymentInstances: PaymentInstance[];
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
  subscriptions: Subscription[];
  financeCategories: Category[];
  members: Member[];
}

type Tab = "resumen" | "pagos" | "gastos" | "ahorro" | "suscripciones";

const TABS: { value: Tab; label: string }[] = [
  { value: "resumen", label: "Resumen" },
  { value: "pagos", label: "Pagos fijos" },
  { value: "gastos", label: "Gastos" },
  { value: "ahorro", label: "Ahorro" },
  { value: "suscripciones", label: "Suscripciones" },
];

export function FinanceTabs({
  resumen,
  fixedPayments,
  paymentInstances,
  expenses,
  savingsGoals,
  subscriptions,
  financeCategories,
  members,
}: FinanceTabsProps) {
  const [tab, setTab] = useState<Tab>("resumen");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium",
              tab === item.value ? "bg-terracotta text-cream" : "bg-card text-muted",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "resumen" && <ResumenTab {...resumen} />}
      {tab === "pagos" && (
        <FixedPaymentsTab payments={fixedPayments} instances={paymentInstances} categories={financeCategories} />
      )}
      {tab === "gastos" && <ExpensesTab expenses={expenses} categories={financeCategories} members={members} />}
      {tab === "ahorro" && <SavingsTab goals={savingsGoals} />}
      {tab === "suscripciones" && (
        <SubscriptionsTab subscriptions={subscriptions} categories={financeCategories} />
      )}
    </div>
  );
}
