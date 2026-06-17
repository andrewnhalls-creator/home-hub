import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";

interface ResumenTabProps {
  upcomingCount: number;
  overdueCount: number;
  paidThisMonthTotal: number;
  pendingThisMonthTotal: number;
  totalFixedThisMonth: number;
  expensesThisMonthTotal: number;
  activeSubscriptionsTotal: number;
  savingsProgressPct: number | null;
}

interface KpiChipProps {
  label: string;
  value: string;
  danger?: boolean;
}

function KpiChip({ label, value, danger = false }: KpiChipProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)]">
      <p className={cn("text-lg font-bold leading-none", danger ? "text-danger" : "text-brown")}>
        {value}
      </p>
      <p className="mt-1.5 text-[11px] leading-tight text-muted">{label}</p>
    </div>
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
}: ResumenTabProps) {
  return (
    <div className="flex flex-col gap-3">
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
    </div>
  );
}
