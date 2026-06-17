"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart2,
  CreditCard,
  ShoppingBag,
  PiggyBank,
  RefreshCw,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
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

const TABS: { value: Tab; label: string; icon: LucideIcon }[] = [
  { value: "resumen",       label: "Resumen",       icon: BarChart2   },
  { value: "pagos",         label: "Pagos",         icon: CreditCard  },
  { value: "gastos",        label: "Gastos",        icon: ShoppingBag },
  { value: "ahorro",        label: "Ahorro",        icon: PiggyBank   },
  { value: "suscripciones", label: "Suscripciones", icon: RefreshCw   },
  { value: "hipoteca",      label: "Hipoteca",      icon: Landmark    },
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
      {/* Month context */}
      <p className="text-sm text-muted">{currentMonthLabel()}</p>

      {/* Mobile: 2-column grid of section cards */}
      <div role="tablist" aria-label="Secciones de finanzas" className="grid grid-cols-2 gap-2 md:hidden">
        {TABS.map(({ value, label, icon: Icon }) => {
          const active = tab === value;
          return (
            <button
              key={value}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(value)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
                active
                  ? "border-terracotta/30 bg-terracotta text-cream shadow-[var(--shadow-card)]"
                  : "border-border bg-card text-brown hover:bg-sand",
              )}
            >
              <Icon
                className={cn("h-4 w-4 shrink-0", active ? "text-cream" : "text-muted")}
                aria-hidden
              />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Tablet+: horizontal scrollable strip */}
      <div className="hidden md:block">
        <SegmentedControl
          options={TABS.map(({ value, label }) => ({ value, label }))}
          value={tab}
          onChange={setTab}
          scrollable
          aria-label="Secciones de finanzas"
        />
      </div>

      {tab === "resumen" && (
        <ResumenTab
          {...resumen}
          mortgages={mortgages}
          mortgagePayments={mortgagePayments}
          onGoToMortgage={() => setTab("hipoteca")}
        />
      )}
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
