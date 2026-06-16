import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
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
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardTitle>{upcomingCount}</CardTitle>
          <CardDescription>Próximos pagos</CardDescription>
        </Card>
        <Card>
          <CardTitle>{overdueCount}</CardTitle>
          <CardDescription>Pagos vencidos</CardDescription>
        </Card>
        <Card>
          <CardTitle>{formatCurrency(paidThisMonthTotal)}</CardTitle>
          <CardDescription>Pagado este mes</CardDescription>
        </Card>
        <Card>
          <CardTitle>{formatCurrency(pendingThisMonthTotal)}</CardTitle>
          <CardDescription>Pendiente este mes</CardDescription>
        </Card>
      </div>
      <Card>
        <CardTitle>{formatCurrency(totalFixedThisMonth)}</CardTitle>
        <CardDescription>Total de pagos fijos este mes</CardDescription>
      </Card>
      <Card>
        <CardTitle>{formatCurrency(expensesThisMonthTotal)}</CardTitle>
        <CardDescription>Gastos variables este mes</CardDescription>
      </Card>
      <Card>
        <CardTitle>{formatCurrency(activeSubscriptionsTotal)}</CardTitle>
        <CardDescription>Suscripciones activas (importe mensual)</CardDescription>
      </Card>
      {savingsProgressPct !== null && (
        <Card>
          <CardTitle>{Math.round(savingsProgressPct)}%</CardTitle>
          <CardDescription>Progreso medio de los objetivos de ahorro</CardDescription>
        </Card>
      )}
    </div>
  );
}
