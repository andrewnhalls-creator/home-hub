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
  activeSubscriptionsTotal: number;
  savingsProgressPct: number | null;
  monthlyBudget: number | null;
  mortgages?: Mortgage[];
  mortgagePayments?: MortgagePayment[];
  onGoToMortgage?: () => void;
}

interface KpiChipProps {
  label: string;
  value: string;
  danger?: boolean;
}

function KpiChip({ label, value, danger = false }: KpiChipProps) {
  return (
    <div
      className="rounded-[var(--radius-xl)] border border-border bg-white/[0.07] p-3 shadow-[var(--shadow-card)]"
    >
      <p className={cn("text-lg font-bold leading-none", danger ? "text-danger" : "text-brown")}>
        {value}
      </p>
      <p className="mt-1.5 text-[12px] leading-tight text-muted">{label}</p>
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

interface MortgageCardProps {
  mortgage: Mortgage;
  payments: MortgagePayment[];
  onClick?: () => void;
}

function MortgageCard({ mortgage, payments, onClick }: MortgageCardProps) {
  const amortisedPct =
    mortgage.original_principal > 0
      ? Math.max(0, Math.min(100, ((mortgage.original_principal - mortgage.current_balance) / mortgage.original_principal) * 100))
      : 0;
  const nextDate = nextPendingPaymentDate(mortgage, payments);

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
              {mortgage.lender && <p className="text-xs text-muted">{mortgage.lender}</p>}
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
  activeSubscriptionsTotal,
  savingsProgressPct,
  monthlyBudget,
  mortgages = [],
  mortgagePayments = [],
  onGoToMortgage,
}: ResumenTabProps) {
  const activeMortgages = mortgages.filter((m) => m.status === "activa" && !m.deleted_at);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <PrintButton label="Exportar PDF" />
      </div>
      <BudgetCard monthlyBudget={monthlyBudget} spent={expensesThisMonthTotal} />
      {/* 6-chip KPI grid — numbers only, colour reserved for problems */}
      <div className="grid grid-cols-3 gap-2">
        <KpiChip label="Próximos" value={String(upcomingCount)} />
        <KpiChip label="Vencidos" value={String(overdueCount)} danger={overdueCount > 0} />
        <KpiChip
          label="Ahorro"
          value={savingsProgressPct !== null ? `${Math.round(savingsProgressPct)}%` : "—"}
        />
        <KpiChip label="Pagado" value={formatCurrency(paidThisMonthTotal)} />
        <KpiChip label="Pendiente" value={formatCurrency(pendingThisMonthTotal)} />
        <KpiChip label="Variables" value={formatCurrency(expensesThisMonthTotal)} />
      </div>

      {/* Secondary totals — context for the chips above */}
      <Card variant="subtle">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted">Total pagos fijos</span>
            <span className="text-sm font-semibold text-brown tabular-nums">
              {formatCurrency(totalFixedThisMonth)}
            </span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted">Suscripciones activas</span>
            <span className="text-sm font-semibold text-brown tabular-nums">
              {formatCurrency(activeSubscriptionsTotal)}/mes
            </span>
          </div>
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
