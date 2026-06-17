"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ResumenTab } from "@/components/finance/ResumenTab";
import { FixedPaymentsTab } from "@/components/finance/FixedPaymentsTab";
import { ExpensesTab } from "@/components/finance/ExpensesTab";
import { SavingsTab } from "@/components/finance/SavingsTab";
import { SubscriptionsTab } from "@/components/finance/SubscriptionsTab";
import { MortgageTab } from "@/components/finance/MortgageTab";
import type { Category, Expense, FixedPayment, Mortgage, MortgagePayment, PaymentInstance, SavingsGoal, Subscription } from "@/lib/types";

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
  mortgages: Mortgage[];
  mortgagePayments: MortgagePayment[];
  financeCategories: Category[];
  members: Member[];
}

type Tab = "resumen" | "pagos" | "gastos" | "ahorro" | "suscripciones" | "hipoteca";

const TABS: { value: Tab; label: string }[] = [
  { value: "resumen",       label: "Resumen"       },
  { value: "pagos",         label: "Pagos"         },
  { value: "gastos",        label: "Gastos"        },
  { value: "ahorro",        label: "Ahorro"        },
  { value: "suscripciones", label: "Suscripciones" },
  { value: "hipoteca",      label: "Hipoteca"      },
];

function currentMonthLabel(): string {
  const raw = format(new Date(), "MMMM yyyy", { locale: es });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function FinanceTabs({
  resumen,
  fixedPayments,
  paymentInstances,
  expenses,
  savingsGoals,
  subscriptions,
  mortgages,
  mortgagePayments,
  financeCategories,
  members,
}: FinanceTabsProps) {
  const [tab, setTab] = useState<Tab>("resumen");

  return (
    <div className="flex flex-col gap-4">
      {/* Month context + tab strip */}
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted">{currentMonthLabel()}</p>
        <SegmentedControl
          options={TABS}
          value={tab}
          onChange={setTab}
          scrollable
          aria-label="Secciones de finanzas"
        />
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
      {tab === "hipoteca" && (
        <MortgageTab mortgages={mortgages} payments={mortgagePayments} />
      )}
    </div>
  );
}
