"use client";

import { useActionState, useEffect, useState } from "react";
import { PencilSimple } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { PrintButton } from "@/components/ui/PrintButton";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/format";
import { BudgetCard } from "@/components/finance/BudgetCard";
import { updateHouseholdBalance } from "@/app/(app)/finanzas/actions";
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
  paidSubsThisMonthTotal: number;
  pendingSubsThisMonthTotal: number;
  savingsProgressPct: number | null;
  monthlyBudget: number | null;
  totalMonthlyIncome: number;
  accountBalance: number | null;
  mortgages?: Mortgage[];
  mortgagePayments?: MortgagePayment[];
  onGoToMortgage?: () => void;
  onGoToIngresos?: () => void;
  onGoToGastosFijos?: () => void;
  onGoToSuscripciones?: () => void;
  onGoToGastos?: () => void;
}

interface TappableKpiProps {
  label: string;
  value: string;
  sub?: string;
  variant?: "default" | "positive" | "danger" | "warning";
  onClick?: () => void;
}

function TappableKpi({ label, value, sub, variant = "default", onClick }: TappableKpiProps) {
  const valueClass = {
    default: "text-brown",
    positive: "text-sage",
    danger: "text-danger",
    warning: "text-amber",
  }[variant];

  const el = (
    <div
      className={cn(
        "flex flex-col rounded-[var(--radius-xl)] border border-border bg-white/[0.07] p-3 shadow-[var(--shadow-card)] transition",
        onClick && "cursor-pointer hover:border-terracotta/30 hover:bg-white/[0.12] active:scale-[0.97]",
      )}
    >
      <p className={cn("text-base font-bold leading-none tabular-nums", valueClass)}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] tabular-nums text-muted">{sub}</p>}
      <p className="mt-1.5 text-[11px] leading-tight text-muted">{label}</p>
    </div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta rounded-[var(--radius-xl)]">
        {el}
      </button>
    );
  }
  return el;
}

function PaymentSplitRow({
  label,
  paid,
  pending,
  onClick,
}: {
  label: string;
  paid: number;
  pending: number;
  onClick?: () => void;
}) {
  const total = paid + pending;
  const paidPct = total > 0 ? (paid / total) * 100 : 0;

  const inner = (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-brown">{label}</p>
        <p className="text-sm font-semibold text-brown tabular-nums">{formatCurrency(total)}</p>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-sage transition-all"
          style={{ width: `${paidPct}%` }}
        />
      </div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-sage tabular-nums">✓ {formatCurrency(paid)} pagado</span>
        {pending > 0
          ? <span className="text-amber tabular-nums">{formatCurrency(pending)} pendiente</span>
          : <span className="text-muted">Todo pagado</span>
        }
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-[var(--radius-xl)] border border-border bg-white/[0.07] p-4 text-left shadow-[var(--shadow-card)] transition hover:border-terracotta/30 hover:bg-white/[0.12] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
      >
        {inner}
      </button>
    );
  }
  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-white/[0.07] p-4 shadow-[var(--shadow-card)]">
      {inner}
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

function BalanceEditForm({
  currentBalance,
  onSuccess,
  onCancel,
}: {
  currentBalance: number | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [state, formAction, isPending] = useActionState(updateHouseholdBalance, {});

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Input
        label="Saldo actual (€)"
        name="balance"
        type="number"
        step="0.01"
        min="0"
        required
        defaultValue={currentBalance != null ? String(currentBalance) : ""}
      />
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="mt-2 flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" isLoading={isPending}>
          Guardar
        </Button>
      </div>
    </form>
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
  paidSubsThisMonthTotal,
  pendingSubsThisMonthTotal,
  savingsProgressPct,
  monthlyBudget,
  totalMonthlyIncome,
  accountBalance,
  mortgages = [],
  mortgagePayments = [],
  onGoToMortgage,
  onGoToIngresos,
  onGoToGastosFijos,
  onGoToSuscripciones,
  onGoToGastos,
}: ResumenTabProps) {
  const { showToast } = useToast();
  const [isBalanceOpen, setIsBalanceOpen] = useState(false);

  const activeMortgages = mortgages.filter((m) => m.status === "activa" && !m.deleted_at);

  const annualMonthlyEquiv = annualSubscriptionsTotal / 12;
  const totalOut = totalFixedThisMonth + monthlySubscriptionsTotal + annualMonthlyEquiv + expensesThisMonthTotal;
  const disponible = totalMonthlyIncome - totalOut;
  const isPositive = disponible >= 0;

  const totalPending = pendingThisMonthTotal + pendingSubsThisMonthTotal;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <PrintButton label="Exportar PDF" />
      </div>

      {/* Hero: account balance + disponible */}
      <div className="grid grid-cols-2 gap-2">
        <div className="relative rounded-[var(--radius-xl)] border border-border bg-white/[0.07] p-4 shadow-[var(--shadow-card)]">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">Saldo en cuenta</p>
          {accountBalance != null ? (
            <p className="mt-1 text-xl font-bold tabular-nums text-brown">
              {formatCurrency(accountBalance)}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted">No configurado</p>
          )}
          <p className="mt-1 text-[10px] text-muted/60">Saldo actual</p>
          <button
            type="button"
            aria-label="Actualizar saldo"
            onClick={() => setIsBalanceOpen(true)}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:text-brown active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
          >
            <PencilSimple className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-border bg-white/[0.07] p-4 shadow-[var(--shadow-card)]">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">Disponible</p>
          {totalMonthlyIncome > 0 ? (
            <>
              <p className={cn("mt-1 text-xl font-bold tabular-nums", isPositive ? "text-sage" : "text-danger")}>
                {formatCurrency(disponible)}
              </p>
              <p className="mt-1 text-[10px] text-muted/60">Este ciclo</p>
            </>
          ) : (
            <button
              type="button"
              onClick={onGoToIngresos}
              className="mt-1 text-xs text-terracotta hover:underline focus-visible:outline-none"
            >
              Añadir ingresos →
            </button>
          )}
        </div>
      </div>

      {/* KPI chips — tappable */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <TappableKpi
          label="Ingresos"
          value={totalMonthlyIncome > 0 ? formatCurrency(totalMonthlyIncome) : "—"}
          variant="positive"
          onClick={onGoToIngresos}
        />
        <TappableKpi
          label="Gastos fijos"
          value={formatCurrency(totalFixedThisMonth)}
          onClick={onGoToGastosFijos}
        />
        <TappableKpi
          label="Suscripciones"
          value={formatCurrency(monthlySubscriptionsTotal)}
          sub={annualSubscriptionsTotal > 0 ? `+ ${formatCurrency(annualSubscriptionsTotal / 12)}/mes anuales` : undefined}
          onClick={onGoToSuscripciones}
        />
        <TappableKpi
          label="Gastos variables"
          value={formatCurrency(expensesThisMonthTotal)}
          onClick={onGoToGastos}
        />
      </div>

      {/* Status chips row */}
      <div className="grid grid-cols-3 gap-2">
        <TappableKpi
          label="Próximos"
          value={String(upcomingCount)}
          variant={upcomingCount > 0 ? "warning" : "default"}
        />
        <TappableKpi
          label="Vencidos"
          value={String(overdueCount)}
          variant={overdueCount > 0 ? "danger" : "default"}
        />
        <TappableKpi
          label="Ahorro"
          value={savingsProgressPct !== null ? `${Math.round(savingsProgressPct)}%` : "—"}
          variant="positive"
        />
      </div>

      {/* Gastos fijos paid/pending split */}
      <PaymentSplitRow
        label="Gastos fijos este ciclo"
        paid={paidThisMonthTotal}
        pending={pendingThisMonthTotal}
        onClick={onGoToGastosFijos}
      />

      {/* Suscripciones paid/pending split */}
      <PaymentSplitRow
        label="Suscripciones mensuales"
        paid={paidSubsThisMonthTotal}
        pending={pendingSubsThisMonthTotal}
        onClick={onGoToSuscripciones}
      />

      {/* Variable expenses vs budget */}
      <BudgetCard monthlyBudget={monthlyBudget} spent={expensesThisMonthTotal} />

      {/* Annual subscriptions note */}
      {annualSubscriptionsTotal > 0 && (
        <Card variant="subtle">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted">Suscripciones anuales</span>
            <div className="text-right">
              <p className="text-sm font-semibold text-brown tabular-nums">
                {formatCurrency(annualSubscriptionsTotal)}/año
              </p>
              <p className="text-[11px] text-muted tabular-nums">
                ≈ {formatCurrency(annualSubscriptionsTotal / 12)}/mes
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Total pending */}
      {totalPending > 0 && (
        <div className="rounded-[var(--radius-xl)] border border-amber/20 bg-amber/[0.06] p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-brown">Total pendiente de pagar</p>
            <p className="text-base font-bold text-amber tabular-nums">{formatCurrency(totalPending)}</p>
          </div>
          <p className="mt-1 text-xs text-muted">
            Gastos fijos + suscripciones pendientes este ciclo
          </p>
        </div>
      )}

      {/* Mortgage summary cards */}
      {activeMortgages.map((m) => (
        <MortgageCard
          key={m.id}
          mortgage={m}
          payments={mortgagePayments}
          onClick={onGoToMortgage}
        />
      ))}

      <Modal isOpen={isBalanceOpen} onClose={() => setIsBalanceOpen(false)} title="Actualizar saldo en cuenta">
        <BalanceEditForm
          currentBalance={accountBalance}
          onSuccess={() => { setIsBalanceOpen(false); showToast("Saldo actualizado"); }}
          onCancel={() => setIsBalanceOpen(false)}
        />
      </Modal>
    </div>
  );
}
