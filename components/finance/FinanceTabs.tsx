"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChartBar,
  ChartPie,
  Coins,
  CreditCard,
  ShoppingBag,
  PiggyBank,
  ArrowsClockwise,
  Bank,
  TrendUp,
  type Icon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ResumenTab } from "@/components/finance/ResumenTab";
import { IngresoTab } from "@/components/finance/IngresoTab";
import { FixedPaymentsTab } from "@/components/finance/FixedPaymentsTab";
import { ExpensesTab } from "@/components/finance/ExpensesTab";
import { SavingsTab } from "@/components/finance/SavingsTab";
import { SubscriptionsTab } from "@/components/finance/SubscriptionsTab";
import { MortgageTab } from "@/components/finance/MortgageTab";
import { PresupuestosTab } from "@/components/finance/PresupuestosTab";
import { PlanAhorroTab } from "@/components/finance/PlanAhorroTab";
import { ExportButton } from "@/components/finance/ExportButton";
import type { Category, CategoryBudget, Expense, FixedPayment, IncomeSource, Mortgage, MortgagePayment, PaymentInstance, SavingsGoal, Subscription } from "@/lib/types";

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
    monthlySubscriptionsTotal: number;
    annualSubscriptionsTotal: number;
    paidSubsThisMonthTotal: number;
    pendingSubsThisMonthTotal: number;
    savingsProgressPct: number | null;
    monthlyBudget: number | null;
    totalMonthlyIncome: number;
    accountBalance: number | null;
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
  incomeSources: IncomeSource[];
  categoryBudgets: CategoryBudget[];
  cycleLabel?: string;
  cycleStart?: string;
  cycleEnd?: string;
}

type Tab = "resumen" | "ingresos" | "gastos-fijos" | "gastos" | "presupuestos" | "suscripciones" | "ahorro" | "ahorro-plan" | "hipoteca";

const TABS: { value: Tab; label: string; icon: Icon }[] = [
  { value: "resumen",        label: "Resumen",        icon: ChartBar        },
  { value: "ingresos",       label: "Ingresos",       icon: TrendUp         },
  { value: "gastos-fijos",   label: "Gastos Fijos",   icon: CreditCard      },
  { value: "gastos",         label: "Gastos",         icon: ShoppingBag     },
  { value: "presupuestos",   label: "Presupuestos",   icon: ChartPie        },
  { value: "suscripciones",  label: "Suscripciones",  icon: ArrowsClockwise },
  { value: "ahorro",         label: "Ahorro",         icon: PiggyBank       },
  { value: "ahorro-plan",    label: "Plan de ahorro", icon: Coins           },
  { value: "hipoteca",       label: "Hipoteca",       icon: Bank            },
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
  incomeSources,
  categoryBudgets,
  cycleLabel,
  cycleStart,
  cycleEnd,
}: FinanceTabsProps) {
  const [tab, setTab] = useState<Tab>("resumen");

  return (
    <div className="flex flex-col gap-4">
      {/* Cycle label + export */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted">{cycleLabel ?? currentMonthLabel()}</p>
        <ExportButton
          expenses={expenses}
          fixedPayments={fixedPayments}
          subscriptions={subscriptions}
          savingsGoals={savingsGoals}
        />
      </div>

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
                "flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta active:scale-[0.97]",
                active
                  ? "border-terracotta/30 bg-terracotta text-cream shadow-[var(--shadow-card)]"
                  : "border-white/[0.10] bg-white/[0.05] text-brown hover:bg-white/[0.10]",
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

      {/* Tablet (md–lg): horizontal scrollable strip */}
      <div className="hidden md:block lg:hidden">
        <SegmentedControl
          options={TABS.map(({ value, label }) => ({ value, label }))}
          value={tab}
          onChange={setTab}
          scrollable
          aria-label="Secciones de finanzas"
        />
      </div>

      {/* Desktop (lg+): sidebar nav + content side by side */}
      <div className="lg:grid lg:grid-cols-[192px_1fr] lg:items-start lg:gap-6">
        <nav role="tablist" aria-label="Secciones de finanzas" className="hidden lg:flex lg:flex-col lg:gap-0.5">
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
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta active:scale-[0.97]",
                  active
                    ? "bg-terracotta text-cream"
                    : "text-brown hover:bg-white/[0.07]",
                )}
              >
                <Icon
                  className={cn("h-4 w-4 shrink-0", active ? "text-cream" : "text-muted")}
                  aria-hidden
                />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div key={tab} className="animate-tab-enter">
          {tab === "resumen" && (
            <ResumenTab
              {...resumen}
              mortgages={mortgages}
              mortgagePayments={mortgagePayments}
              onGoToMortgage={() => setTab("hipoteca")}
              onGoToIngresos={() => setTab("ingresos")}
              onGoToGastosFijos={() => setTab("gastos-fijos")}
              onGoToSuscripciones={() => setTab("suscripciones")}
              onGoToGastos={() => setTab("gastos")}
            />
          )}
          {tab === "ingresos" && <IngresoTab sources={incomeSources} />}
          {tab === "gastos-fijos" && (
            <FixedPaymentsTab payments={fixedPayments} instances={paymentInstances} categories={financeCategories} />
          )}
          {tab === "gastos" && <ExpensesTab expenses={expenses} categories={financeCategories} members={members} />}
          {tab === "presupuestos" && (
            <PresupuestosTab
              categoryBudgets={categoryBudgets}
              expenses={expenses}
              categories={financeCategories}
              cycleStart={cycleStart ?? ""}
              cycleEnd={cycleEnd ?? ""}
            />
          )}
          {tab === "suscripciones" && (
            <SubscriptionsTab subscriptions={subscriptions} categories={financeCategories} />
          )}
          {tab === "ahorro" && <SavingsTab goals={savingsGoals} />}
          {tab === "ahorro-plan" && <PlanAhorroTab goals={savingsGoals} mortgages={mortgages} />}
          {tab === "hipoteca" && (
            <MortgageTab mortgages={mortgages} payments={mortgagePayments} />
          )}
        </div>
      </div>
    </div>
  );
}
