"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, PencilSimple, Trash, CalendarDot, CheckCircle, Clock } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/format";
import { getSubscriptionCycleStatus } from "@/lib/cycle";
import { FixedPaymentForm } from "@/components/finance/FixedPaymentForm";
import {
  createFixedPayment,
  updateFixedPayment,
  deleteFixedPayment,
  markPaymentInstancePaid,
  skipPaymentInstance,
} from "@/app/(app)/finanzas/actions";
import type { Category, FixedPayment, PaymentInstance } from "@/lib/types";

interface FixedPaymentsTabProps {
  payments: FixedPayment[];
  instances: PaymentInstance[];
  categories: Category[];
}

type DerivedStatus = "pagado" | "pendiente" | "omitido";

function deriveStatus(
  payment: FixedPayment,
  instance: PaymentInstance | undefined,
): DerivedStatus {
  if (instance?.status === "pagado") return "pagado";
  if (instance?.status === "omitido") return "omitido";
  if (payment.due_day != null) return getSubscriptionCycleStatus(payment.due_day);
  return "pendiente";
}

interface PaymentRowProps {
  payment: FixedPayment;
  instance: PaymentInstance | undefined;
  onEdit: (p: FixedPayment) => void;
  onDelete: (p: FixedPayment) => void;
  onMarkPaid: (instanceId: string) => void;
  onSkip: (instanceId: string) => void;
  isPending: boolean;
}

function PaymentRow({ payment, instance, onEdit, onDelete, onMarkPaid, onSkip, isPending }: PaymentRowProps) {
  const status = deriveStatus(payment, instance);

  return (
    <li>
      <Card className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-brown">{payment.name}</p>
            <p className="text-xs text-muted">
              {formatCurrency(payment.amount)}
              {payment.due_day ? ` · Día ${payment.due_day}` : ""}
              {payment.bank_account ? ` · ${payment.bank_account}` : ""}
              {!payment.is_active ? " · Inactivo" : ""}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {status === "pagado" && (
              <Badge variant="success">
                <CheckCircle className="mr-1 h-3 w-3" aria-hidden />
                Pagado
              </Badge>
            )}
            {status === "pendiente" && (
              <Badge variant="warning">
                <Clock className="mr-1 h-3 w-3" aria-hidden />
                Pendiente
              </Badge>
            )}
            {status === "omitido" && <Badge variant="neutral">Omitido</Badge>}

            <button
              type="button"
              aria-label="Editar pago fijo"
              onClick={() => onEdit(payment)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:bg-white/[0.07] active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
            >
              <PencilSimple className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Eliminar pago fijo"
              onClick={() => onDelete(payment)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:text-danger active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
            >
              <Trash className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        {/* Action buttons only for items still pending where an instance exists */}
        {status === "pendiente" && instance && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              isLoading={isPending}
              onClick={() => onMarkPaid(instance.id)}
            >
              Marcar como pagado
            </Button>
            <Button
              type="button"
              variant="secondary"
              isLoading={isPending}
              onClick={() => onSkip(instance.id)}
            >
              Omitir
            </Button>
          </div>
        )}
      </Card>
    </li>
  );
}

export function FixedPaymentsTab({ payments, instances, categories }: FixedPaymentsTabProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<FixedPayment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<FixedPayment | null>(null);

  const instanceByPaymentId = useMemo(
    () => new Map(instances.map((i) => [i.fixed_payment_id, i])),
    [instances],
  );

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  // Group payments by category name; uncategorised last
  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; payments: FixedPayment[] }>();
    map.set("__none__", { label: "Sin categoría", payments: [] });

    for (const p of payments) {
      const cat = p.category_id ? categoryMap.get(p.category_id) : undefined;
      const key = cat?.id ?? "__none__";
      if (!map.has(key)) map.set(key, { label: cat?.name ?? "Sin categoría", payments: [] });
      map.get(key)!.payments.push(p);
    }

    // Move uncategorised to end if empty, remove if totally empty
    const result: { key: string; label: string; payments: FixedPayment[] }[] = [];
    for (const [key, val] of map) {
      if (key === "__none__" && val.payments.length === 0) continue;
      result.push({ key, ...val });
    }
    // Sort: "__none__" last, others alphabetically
    return result.sort((a, b) => {
      if (a.key === "__none__") return 1;
      if (b.key === "__none__") return -1;
      return a.label.localeCompare(b.label, "es");
    });
  }, [payments, categoryMap]);

  const rowProps = {
    onEdit: setEditingPayment,
    onDelete: setDeletingPayment,
    onMarkPaid: (id: string) => startTransition(() => { markPaymentInstancePaid(id); showToast("Marcado como pagado"); }),
    onSkip: (id: string) => startTransition(() => { skipPaymentInstance(id); showToast("Omitido este ciclo"); }),
    isPending,
  };

  if (payments.length === 0) {
    return (
      <>
        <EmptyState
          icon={CalendarDot}
          title="Sin gastos fijos todavía."
          description="Añade aquí lo que pagáis siempre: alquiler, seguros, préstamos... y haz seguimiento de cada cuota mes a mes."
          action={
            <Button type="button" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              Añadir gasto fijo
            </Button>
          }
        />
        <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Añadir gasto fijo">
          <FixedPaymentForm
            action={createFixedPayment}
            categories={categories}
            onSuccess={() => { setIsAddOpen(false); showToast("Gasto fijo añadido"); }}
            onCancel={() => setIsAddOpen(false)}
          />
        </Modal>
      </>
    );
  }

  // Summary totals
  const paidTotal = payments
    .filter((p) => p.is_active && deriveStatus(p, instanceByPaymentId.get(p.id)) === "pagado")
    .reduce((s, p) => s + Number(p.amount), 0);
  const pendingTotal = payments
    .filter((p) => p.is_active && deriveStatus(p, instanceByPaymentId.get(p.id)) === "pendiente")
    .reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Cycle summary */}
      <Card variant="subtle">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] text-muted">Ya pagado este ciclo</p>
            <p className="text-base font-bold text-sage tabular-nums">{formatCurrency(paidTotal)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted">Pendiente de pagar</p>
            <p className="text-base font-bold text-brown tabular-nums">{formatCurrency(pendingTotal)}</p>
          </div>
        </div>
      </Card>

      {grouped.map(({ key, label, payments: groupPayments }) => {
        const groupTotal = groupPayments
          .filter((p) => p.is_active)
          .reduce((s, p) => s + Number(p.amount), 0);
        return (
          <div key={key} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
              <p className="text-xs text-muted tabular-nums">{formatCurrency(groupTotal)}/mes</p>
            </div>
            <ul className="flex flex-col gap-2">
              {groupPayments.map((p) => (
                <PaymentRow
                  key={p.id}
                  payment={p}
                  instance={instanceByPaymentId.get(p.id)}
                  {...rowProps}
                />
              ))}
            </ul>
          </div>
        );
      })}

      <Button type="button" onClick={() => setIsAddOpen(true)} className="mt-2 w-full">
        <Plus className="h-4 w-4" aria-hidden />
        Añadir gasto fijo
      </Button>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Añadir gasto fijo">
        <FixedPaymentForm
          action={createFixedPayment}
          categories={categories}
          onSuccess={() => { setIsAddOpen(false); showToast("Gasto fijo añadido"); }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      <Modal isOpen={!!editingPayment} onClose={() => setEditingPayment(null)} title="Editar gasto fijo">
        {editingPayment && (
          <FixedPaymentForm
            action={updateFixedPayment.bind(null, editingPayment.id)}
            categories={categories}
            payment={editingPayment}
            onSuccess={() => { setEditingPayment(null); showToast("Gasto fijo actualizado"); }}
            onCancel={() => setEditingPayment(null)}
          />
        )}
      </Modal>

      <Modal isOpen={!!deletingPayment} onClose={() => setDeletingPayment(null)} title="Eliminar gasto fijo">
        <p className="text-sm text-brown">¿Seguro que quieres eliminarlo?</p>
        <div className="mt-4 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setDeletingPayment(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            isLoading={isPending}
            onClick={() =>
              startTransition(async () => {
                if (deletingPayment) await deleteFixedPayment(deletingPayment.id);
                setDeletingPayment(null);
                showToast("Gasto fijo eliminado");
              })
            }
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
