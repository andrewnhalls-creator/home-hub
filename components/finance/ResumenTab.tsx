import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { PrintButton } from "@/components/ui/PrintButton";
import { formatCurrency } from "@/lib/format";
import { BudgetCard } from "@/components/finance/BudgetCard";
import type { Mortgage, MortgagePayment } from "@/lib/types";

interface ResumenTabProps {
  upcomingCount: number;
  overdueCount: number;
  paidThisMonthTotal: number;
  pendingThisMonthTotal: number;
  totalFixedThisMonth: number;
  expensesThisMonthTotal: number;
  monthlySubscriptionsTotal: number;
  annualSubscriptionsTotal: number;
  savingsProgressPct: number | null;
  monthlyBudget: number | null;
  totalMonthlyIncome: number;
  mortgages?: Mortgage[];
  mortgagePayments?: MortgagePayment[];
  onGoToMortgage?: () => void;
  onGoToIngresos?: () => void;
}

interface KpiChipProps {
  label: string;
  value: string;
  danger?: boolean;
}

function KpiChip({ label, value, danger = false }: KpiChipProps) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-white/[0.07] p-3 shadow-[var(--shadow-card)]">
      <p className={cn("text-lg font-bold leading-none", danger ? "text-danger" : "text-brown")}>
        {value}
      </p>
      <p className="mt-1.5 text-[12px] leading-tight text-muted">{label}</p>
    </div>
  );
}

function BalanceCard({
  income,
  fixedPayments,
  monthlySubscriptions,
  annualSubscriptions,
  variableExpenses,
  onGoToIngresos,
}: {
  income: number;
  fixedPayments: number;
  monthlySubscriptions: number;
  annualSubscriptions: number;
  variableExpenses: number;
  onGoToIngresos?: () => void;
}) {
  const annualMonthlyEquiv = annualSubscriptions / 12;
  const totalOut = fixedPayments + monthlySubscriptions + annualMonthlyEquiv + variableExpenses;
  const balance = income - totalOut;
  const isPositive = balance >= 0;
  const hasIncome = income > 0;

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-white/[0.07] p-4 shadow-[var(--shadow-card)]">
      <p className="text-[12px] font-medium uppercase tracking-wider text-muted">Disponible este mes</p>

      {hasIncome ? (
        <>
          <p className={cn("mt-1 text-3xl font-bold tabular-nums", isPositive ? "text-sage" : "text-danger")}>
            {formatCurrency(balance)}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3">
            <div>
              <p className="text-[11px] text-muted">Ingresos</p>
              <p className="text-sm font-semibold text-sage tabular-nums">{formatCurrency(income)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">Gastos totales</p>
              <p className="text-sm font-semibold text-brown tabular-nums">{formatCurrency(totalOut)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">Pagos fijos</p>
              <p className="text-sm tabular-nums text-brown">{formatCurrency(fixedPayments)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted">Suscripciones</p>
              <p className="text-sm tabular-nums text-brown">
                {formatCurrency(monthlySubscriptions + annualMonthlyEquiv)}
                <span className="ml-1 text-[11px] text-muted">/mes</span>
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-2">
          <p className="text-sm text-muted">
            Añade tus ingresos para ver el balance real del hogar.
          </p>
          {onGoToIngresos && (
            <button
              type="button"
              onClick={onGoToIngresos}
              className="mt-2 text-sm font-medium text-terracotta hover:underline focus-visible:outline-none"
            >
              Añadir ingresos →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function nextPendingPaymentDate(mortgage: Mortgage, payments: MortgagePayment[]): string | null {
  const pending = payments
    .filter((p) => p.mortgage_id === mortgage.id && p.status === "pendiente")
    .sort((a, b) => a.due_date.localeCompare(b.due_date));
  if (pending.length > 0) {
    const d = new Date(pending[0].due_date);
    return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
  }
  if (mortgage.payment_day) {
    const now = new Date();
    return `${String(mortgage.payment_day).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  }
  return null;
}

function MortgageCard({
  mortgage,
  payments,
  onClick,
}: {
  mortgage: Mortgage;
  payments: MortgagePayment[];
  onClick?: () => void;
}) {
  const amortisedPct =
    mortgage.original_principal > 0
      ? Math.max(0, Math.min(100, ((mortgage.original_principal - mortgage.current_balance) / mortgage.original_principal) * 100))
      : 0;
  const nextDate = nextPendingPaymentDate(mortgage, payments);

  const rateLabel =
    mortgage.rate_type === "mixto"
      ? `${mortgage.interest_rate ?? "—"} % fijo → Euríbor${mortgage.euribor_spread != null ? ` +${mortgage.euribor_spread} %` : ""}`
      : mortgage.rate_type === "variable"
      ? `Euríbor${mortgage.euribor_spread != null ? ` +${mortgage.euribor_spread} %` : ""}`
      : mortgage.interest_rate != null
      ? `${mortgage.interest_rate} % fijo`
      : null;

  const Wrapper = onClick ? "button" : "div";
  const wrapperProps = onClick
    ? { type: "button" as const, onClick, className: "w-full text-left" }
    : { className: "w-full" };

  return (
    <Wrapper {...wrapperProps}>
      <Card variant="subtle">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-brown">{mortgage.name}</p>
              {rateLabel && <p className="text-xs text-muted">{rateLabel}</p>}
            </div>
            {onClick && (
              <span className="shrink-0 rounded-lg bg-terracotta/10 px-2 py-0.5 text-[12px] font-medium text-terracotta">
                Ver hipoteca →
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[12px] text-muted">Saldo pendiente</p>
              <p className="text-base font-bold text-brown tabular-nums">
                {formatCurrency(mortgage.current_balance)}
              </p>
            </div>
            <div>
              <p className="text-[12px] text-muted">Cuota mensual</p>
              <p className="text-base font-bold text-brown tabular-nums">
                {formatCurrency(mortgage.monthly_payment)}
              </p>
            </div>
          </div>

          {nextDate && (
            <div>
              <p className="text-[12px] text-muted">Próximo pago</p>
              <p className="text-sm font-medium text-brown">{nextDate}</p>
            </div>
          )}

          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-[12px] text-muted">Amortizado</p>
              <p className="text-[12px] font-semibold text-sage">{Math.round(amortisedPct)}%</p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
              <div
                className="progress-fill h-full w-full rounded-full bg-sage"
                style={{ transform: `scaleX(${amortisedPct / 100})` }}
              />
            </div>
          </div>
        </div>
      </Card>
    </Wrapper>
  );
}

export function ResumenTab({
  upcomingCount,
  overdueCount,
  paidThisMonthTotal,
  pendingThisMonthTotal,
  totalFixedThisMonth,
  expensesThisMonthTotal,
  monthlySubscriptionsTotal,
  annualSubscriptionsTotal,
  savingsProgressPct,
  monthlyBudget,
  totalMonthlyIncome,
  mortgages = [],
  mortgagePayments = [],
  onGoToMortgage,
  onGoToIngresos,
}: ResumenTabProps) {
  const activeMortgages = mortgages.filter((m) => m.status === "activa" && !m.deleted_at);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <PrintButton label="Exportar PDF" />
      </div>

      {/* Balance card — the most important number */}
      <BalanceCard
        income={totalMonthlyIncome}
        fixedPayments={totalFixedThisMonth}
        monthlySubscriptions={monthlySubscriptionsTotal}
        annualSubscriptions={annualSubscriptionsTotal}
        variableExpenses={expensesThisMonthTotal}
        onGoToIngresos={onGoToIngresos}
      />

      {/* Variable expenses vs budget */}
      <BudgetCard monthlyBudget={monthlyBudget} spent={expensesThisMonthTotal} />

      {/* 4-chip KPI grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <KpiChip label="Próximos" value={String(upcomingCount)} />
        <KpiChip label="Vencidos" value={String(overdueCount)} danger={overdueCount > 0} />
        <KpiChip label="Pagado" value={formatCurrency(paidThisMonthTotal)} />
        <KpiChip
          label="Ahorro"
          value={savingsProgressPct !== null ? `${Math.round(savingsProgressPct)}%` : "—"}
        />
      </div>

      {/* Costs breakdown */}
      <Card variant="subtle">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted">Pagos fijos activos</span>
            <span className="text-sm font-semibold text-brown tabular-nums">
              {formatCurrency(totalFixedThisMonth)}/mes
            </span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted">Suscripciones mensuales</span>
            <span className="text-sm font-semibold text-brown tabular-nums">
              {formatCurrency(monthlySubscriptionsTotal)}/mes
            </span>
          </div>
          {annualSubscriptionsTotal > 0 && (
            <>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted">Suscripciones anuales</span>
                <span className="text-sm font-semibold text-brown tabular-nums">
                  {formatCurrency(annualSubscriptionsTotal)}/año
                  <span className="ml-1 text-[11px] font-normal text-muted">
                    (≈ {formatCurrency(annualSubscriptionsTotal / 12)}/mes)
                  </span>
                </span>
              </div>
            </>
          )}
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted">Gastos variables este mes</span>
            <span className="text-sm font-semibold text-brown tabular-nums">
              {formatCurrency(expensesThisMonthTotal)}
            </span>
          </div>
          {pendingThisMonthTotal > 0 && (
            <>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted">Pendiente de pagar</span>
                <span className="text-sm font-semibold text-amber tabular-nums">
                  {formatCurrency(pendingThisMonthTotal)}
                </span>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Mortgage summary cards */}
      {activeMortgages.map((m) => (
        <MortgageCard
          key={m.id}
          mortgage={m}
          payments={mortgagePayments}
          onClick={onGoToMortgage}
        />
      ))}
    </div>
  );
}
