"use client";

import { useEffect, useRef, useState } from "react";
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
  CaretLeft,
  CaretRight,
  Bank,
  type Icon,
} from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { ResumenTab } from "@/components/finance/ResumenTab";
import { IngresoTab } from "@/components/finance/IngresoTab";
import { FixedPaymentsTab } from "@/components/finance/FixedPaymentsTab";
import { ExpensesTab } from "@/components/finance/ExpensesTab";
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

type Tab = "resumen" | "ingresos" | "gastos-fijos" | "suscripciones" | "gastos-variables" | "gastos" | "plan-ahorro" | "hipoteca" | "deuda";

interface SubPage {
  value: Exclude<Tab, "resumen">;
  label: string;
  icon: Icon;
}

const SUB_PAGES: SubPage[] = [
  { value: "ingresos",         label: "Ingresos",          icon: TrendUp         },
  { value: "gastos-fijos",     label: "Gastos fijos",      icon: CreditCard      },
  { value: "suscripciones",    label: "Suscripciones",     icon: ArrowsClockwise },
  { value: "gastos-variables", label: "Gastos variables",  icon: ChartPie        },
  { value: "gastos",           label: "Gastos",            icon: ShoppingBag     },
  { value: "plan-ahorro",      label: "Plan de ahorro",    icon: PiggyBank       },
  { value: "hipoteca",         label: "Hipoteca",          icon: Bank            },
  { value: "deuda",            label: "Deuda",             icon: Scales          },
];

const ALL_PAGES: { value: Tab; label: string; icon: Icon }[] = [
  { value: "resumen", label: "Resumen", icon: ChartBar },
  ...SUB_PAGES,
];

const ALL_SIDEBAR_TABS: { value: Tab; label: string; icon: Icon }[] = ALL_PAGES;

function currentMonthLabel(): string {
  const raw = format(new Date(), "MMMM yyyy", { locale: es });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

interface DashboardPagerProps {
  pages: typeof ALL_PAGES;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}

function DashboardPager({ pages, currentIndex, onPrev, onNext, onGoTo }: DashboardPagerProps) {
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < pages.length - 1;
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = stripRef.current;
    if (!container) return;
    const activeBtn = container.children[currentIndex] as HTMLElement | undefined;
    activeBtn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [currentIndex]);

  return (
    <div className="flex w-full items-center gap-1">
      {/* Prev arrow — 44 × 44 tap target */}
      <button
        type="button"
        aria-label="Página anterior"
        onClick={onPrev}
        disabled={!canPrev}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
          canPrev
            ? "text-muted hover:bg-white/[0.08] hover:text-brown active:scale-[0.90]"
            : "text-white/[0.15] cursor-default",
        )}
      >
        <CaretLeft weight="bold" className="h-4 w-4" aria-hidden />
      </button>

      {/* Scrollable named tab strip */}
      <div
        ref={stripRef}
        role="tablist"
        aria-label="Páginas de finanzas"
        className="scrollbar-none flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-1"
      >
        {pages.map((page, i) => {
          const isActive = i === currentIndex;
          return (
            <button
              key={page.value}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onGoTo(i)}
              className={cn(
                "flex h-9 shrink-0 items-center rounded-full px-3.5 text-[13px] font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-terracotta focus-visible:ring-offset-1 focus-visible:ring-offset-cream",
                isActive
                  ? "bg-terracotta text-cream"
                  : "bg-white/[0.06] text-muted hover:bg-white/[0.12] hover:text-brown",
              )}
            >
              {page.label}
            </button>
          );
        })}
      </div>

      {/* Next arrow — 44 × 44 tap target */}
      <button
        type="button"
        aria-label="Página siguiente"
        onClick={onNext}
        disabled={!canNext}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
          canNext
            ? "text-muted hover:bg-white/[0.08] hover:text-brown active:scale-[0.90]"
            : "text-white/[0.15] cursor-default",
        )}
      >
        <CaretRight weight="bold" className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
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

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isSwiping = useRef(false);

  const currentIndex = ALL_PAGES.findIndex((p) => p.value === tab);
  const currentSubPage = SUB_PAGES.find((p) => p.value === tab);

  function goTo(t: Tab) {
    setTab(t);
    setShowMenu(false);
  }

  function goToIndex(index: number) {
    if (index >= 0 && index < ALL_PAGES.length) {
      goTo(ALL_PAGES[index].value);
    }
  }

  function goToPrev() {
    goToIndex(currentIndex - 1);
  }

  function goToNext() {
    goToIndex(currentIndex + 1);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    isSwiping.current = false;
  }

  function handleTouchMove(e: React.TouchEvent) {
    const dx = Math.abs(e.targetTouches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.targetTouches[0].clientY - touchStartY.current);
    if (!isSwiping.current && dx > dy && dx > 10) {
      isSwiping.current = true;
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!isSwiping.current) return;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) goToNext();
      else goToPrev();
    }
    isSwiping.current = false;
  }

  function renderContent() {
    switch (tab) {
      case "resumen":
        return (
          <ResumenTab
            {...resumen}
            mortgages={mortgages}
            mortgagePayments={mortgagePayments}
            onGoToMortgage={() => goTo("hipoteca")}
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
        return <PlanAhorroTab goals={savingsGoals} mortgages={mortgages} />;
      case "hipoteca":
        return <MortgageTab mortgages={mortgages} payments={mortgagePayments} />;
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
          /* Section picker overlay */
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
        ) : (
          /* Main page view — unified layout for all pages */
          <div className="flex flex-col gap-3">
            {/* Page header */}
            <div className="flex min-w-0 items-center gap-2">
              {tab !== "resumen" && (
                <button
                  type="button"
                  aria-label="Volver al resumen"
                  onClick={() => goTo("resumen")}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-white/[0.08] active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                </button>
              )}
              <p className="min-w-0 flex-1 truncate text-lg font-bold text-brown">
                {tab === "resumen" ? "Resumen" : currentSubPage?.label}
              </p>
              <button
                type="button"
                aria-label="Ver secciones"
                onClick={() => setShowMenu(true)}
                className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border border-border bg-white/[0.07] px-4 text-sm font-medium text-brown transition hover:bg-white/[0.12] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
              >
                <SquaresFour className="h-4 w-4 text-muted" aria-hidden />
                Menú
              </button>
            </div>

            {/* ── Page switcher: sits between header and first KPI row ── */}
            <DashboardPager
              pages={ALL_PAGES}
              currentIndex={currentIndex}
              onPrev={goToPrev}
              onNext={goToNext}
              onGoTo={goToIndex}
            />

            {/* Swipeable content area */}
            <div
              key={tab}
              className="animate-tab-enter min-w-0"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
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

        <div key={tab} className="animate-tab-enter min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
