"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChartBar,
  ChartPie,
  CreditCard,
  ShoppingBag,
  PiggyBank,
  ArrowsClockwise,
  TrendUp,
  Scales,
  ArrowLeft,
  SquaresFour,
  type Icon,
} from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { ResumenTab } from "@/components/finance/ResumenTab";
import { IngresoTab } from "@/components/finance/IngresoTab";
import { FixedPaymentsTab } from "@/components/finance/FixedPaymentsTab";
import { ExpensesTab } from "@/components/finance/ExpensesTab";
import { SavingsTab } from "@/components/finance/SavingsTab";
import { SubscriptionsTab } from "@/components/finance/SubscriptionsTab";
import { MortgageTab } from "@/components/finance/MortgageTab";
import { PresupuestosTab } from "@/components/finance/PresupuestosTab";
import { PlanAhorroTab } from "@/components/finance/PlanAhorroTab";
import { DeudaTab } from "@/components/finance/DeudaTab";
import { ExportButton } from "@/components/finance/ExportButton";
import type {
  Category,
  CategoryBudget,
  Debt,
  Expense,
  FixedPayment,
  IncomeSource,
  Mortgage,
  MortgagePayment,
  PaymentInstance,
  SavingsGoal,
  Subscription,
} from "@/lib/types";

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
  debts: Debt[];
  cycleLabel?: string;
  cycleStart?: string;
  cycleEnd?: string;
}

type Tab = "resumen" | "ingresos" | "gastos-fijos" | "suscripciones" | "gastos-variables" | "gastos" | "plan-ahorro" | "deuda";

interface SubPage {
  value: Exclude<Tab, "resumen">;
  label: string;
  icon: Icon;
}

const SUB_PAGES: SubPage[] = [
  { value: "ingresos",         label: "Ingresos",                   icon: TrendUp         },
  { value: "gastos-fijos",     label: "Gastos fijos",               icon: CreditCard      },
  { value: "suscripciones",    label: "Suscripciones",              icon: ArrowsClockwise },
  { value: "gastos-variables", label: "Gastos variables",           icon: ChartPie        },
  { value: "gastos",           label: "Gastos",                     icon: ShoppingBag     },
  { value: "plan-ahorro",      label: "Plan de ahorro y hipoteca",  icon: PiggyBank       },
  { value: "deuda",            label: "Deuda",                      icon: Scales          },
];

const ALL_SIDEBAR_TABS: { value: Tab; label: string; icon: Icon }[] = [
  { value: "resumen", label: "Resumen", icon: ChartBar },
  ...SUB_PAGES,
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
  debts,
  cycleLabel,
  cycleStart,
  cycleEnd,
}: FinanceTabsProps) {
  const [tab, setTab] = useState<Tab>("resumen");
  const [showMenu, setShowMenu] = useState(false);

  const currentSubPage = SUB_PAGES.find((p) => p.value === tab);

  function goTo(t: Tab) {
    setTab(t);
    setShowMenu(false);
  }

  function renderContent() {
    switch (tab) {
      case "resumen":
        return (
          <ResumenTab
            {...resumen}
            mortgages={mortgages}
            mortgagePayments={mortgagePayments}
            onGoToMortgage={() => goTo("plan-ahorro")}
            onGoToIngresos={() => goTo("ingresos")}
            onGoToGastosFijos={() => goTo("gastos-fijos")}
            onGoToSuscripciones={() => goTo("suscripciones")}
            onGoToGastos={() => goTo("gastos")}
          />
        );
      case "ingresos":
        return <IngresoTab sources={incomeSources} />;
      case "gastos-fijos":
        return <FixedPaymentsTab payments={fixedPayments} instances={paymentInstances} categories={financeCategories} />;
      case "suscripciones":
        return <SubscriptionsTab subscriptions={subscriptions} categories={financeCategories} />;
      case "gastos-variables":
        return (
          <PresupuestosTab
            categoryBudgets={categoryBudgets}
            expenses={expenses}
            categories={financeCategories}
            cycleStart={cycleStart ?? ""}
            cycleEnd={cycleEnd ?? ""}
          />
        );
      case "gastos":
        return <ExpensesTab expenses={expenses} categories={financeCategories} members={members} />;
      case "plan-ahorro":
        return (
          <div className="flex flex-col gap-6">
            <SavingsTab goals={savingsGoals} />
            <PlanAhorroTab goals={savingsGoals} mortgages={mortgages} />
            <MortgageTab mortgages={mortgages} payments={mortgagePayments} />
          </div>
        );
      case "deuda":
        return <DeudaTab debts={debts} />;
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header row: cycle label + export */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted">{cycleLabel ?? currentMonthLabel()}</p>
        <ExportButton
          expenses={expenses}
          fixedPayments={fixedPayments}
          subscriptions={subscriptions}
          savingsGoals={savingsGoals}
        />
      </div>

      {/* ── MOBILE (< lg) ── */}
      <div className="lg:hidden">
        {showMenu ? (
          /* Section picker */
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-brown">Secciones</p>
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setShowMenu(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-white/[0.08] active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div role="list" className="grid grid-cols-2 gap-2">
              {SUB_PAGES.map(({ value, label, icon: PageIcon }) => (
                <button
                  key={value}
                  role="listitem"
                  type="button"
                  onClick={() => goTo(value)}
                  className="flex items-center gap-2.5 rounded-xl border border-white/[0.10] bg-white/[0.05] px-3 py-3 text-left text-sm font-medium text-brown transition hover:bg-white/[0.10] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                >
                  <PageIcon className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : tab === "resumen" ? (
          /* Resumen landing */
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-brown">Resumen</p>
              <button
                type="button"
                aria-label="Ver secciones"
                onClick={() => setShowMenu(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-white/[0.08] active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
              >
                <SquaresFour className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div key="resumen" className="animate-tab-enter">
              {renderContent()}
            </div>
          </div>
        ) : (
          /* Sub-page view */
          <div className="flex flex-col gap-3">
            {/* Sub-page header */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Volver al resumen"
                onClick={() => goTo("resumen")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-white/[0.08] active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </button>
              <p className="min-w-0 flex-1 truncate text-sm font-semibold text-brown">
                {currentSubPage?.label}
              </p>
              <button
                type="button"
                aria-label="Ver secciones"
                onClick={() => setShowMenu(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-white/[0.08] active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
              >
                <SquaresFour className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {/* Horizontal page-slider strip */}
            <div
              role="tablist"
              aria-label="Secciones de finanzas"
              className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex gap-2" style={{ width: "max-content" }}>
                {SUB_PAGES.map(({ value, label }) => {
                  const active = tab === value;
                  return (
                    <button
                      key={value}
                      role="tab"
                      type="button"
                      aria-selected={active}
                      onClick={() => goTo(value)}
                      className={cn(
                        "h-9 whitespace-nowrap rounded-full px-4 text-[13px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta active:scale-[0.96]",
                        active
                          ? "bg-terracotta text-cream"
                          : "bg-white/[0.07] text-muted hover:bg-white/[0.12]",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-page content */}
            <div key={tab} className="animate-tab-enter">
              {renderContent()}
            </div>
          </div>
        )}
      </div>

      {/* ── DESKTOP (lg+) ── sidebar nav + content */}
      <div className="hidden lg:grid lg:grid-cols-[200px_1fr] lg:items-start lg:gap-6">
        <nav role="tablist" aria-label="Secciones de finanzas" className="flex flex-col gap-0.5">
          {ALL_SIDEBAR_TABS.map(({ value, label, icon: NavIcon }) => {
            const active = tab === value;
            return (
              <button
                key={value}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => goTo(value)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta active:scale-[0.97]",
                  active ? "bg-terracotta text-cream" : "text-brown hover:bg-white/[0.07]",
                )}
              >
                <NavIcon
                  className={cn("h-4 w-4 shrink-0", active ? "text-cream" : "text-muted")}
                  aria-hidden
                />
                <span className="leading-tight">{label}</span>
              </button>
            );
          })}
        </nav>

        <div key={tab} className="animate-tab-enter">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
