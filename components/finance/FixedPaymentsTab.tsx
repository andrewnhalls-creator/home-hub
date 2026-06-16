"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";
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

const STATUS_BADGE: Record<PaymentInstance["status"], "neutral" | "success" | "danger" | "warning"> = {
  pendiente: "neutral",
  pagado: "success",
  vencido: "danger",
  omitido: "warning",
};

const STATUS_LABEL: Record<PaymentInstance["status"], string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  vencido: "Vencido",
  omitido: "Omitido",
};

export function FixedPaymentsTab({ payments, instances, categories }: FixedPaymentsTabProps) {
  const [isPending, startTransition] = useTransition();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<FixedPayment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<FixedPayment | null>(null);

  const instanceByPaymentId = useMemo(
    () => new Map(instances.map((instance) => [instance.fixed_payment_id, instance])),
    [instances],
  );

  if (payments.length === 0) {
    return (
      <>
        <EmptyState title="Todavía no hay pagos fijos." description="Añade el primero para empezar." />
        <Button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="fixed bottom-20 right-4 z-30 rounded-full px-5 shadow-md md:bottom-6"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Añadir pago fijo
        </Button>
        <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Añadir pago fijo">
          <FixedPaymentForm
            action={createFixedPayment}
            categories={categories}
            onSuccess={() => setIsAddOpen(false)}
            onCancel={() => setIsAddOpen(false)}
          />
        </Modal>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {payments.map((payment) => {
          const instance = instanceByPaymentId.get(payment.id);
          return (
            <li key={payment.id}>
              <Card className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brown">{payment.name}</p>
                    <p className="text-xs text-muted">
                      {formatCurrency(payment.amount)}
                      {payment.due_day ? ` · Día ${payment.due_day}` : ""}
                      {!payment.is_active ? " · Inactivo" : ""}
                    </p>
                  </div>
                  {instance && (
                    <Badge variant={STATUS_BADGE[instance.status]}>{STATUS_LABEL[instance.status]}</Badge>
                  )}
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      aria-label="Editar pago fijo"
                      onClick={() => setEditingPayment(payment)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-sand"
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label="Eliminar pago fijo"
                      onClick={() => setDeletingPayment(payment)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-sand"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>

                {instance && instance.status === "pendiente" && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      isLoading={isPending}
                      onClick={() => startTransition(() => markPaymentInstancePaid(instance.id))}
                    >
                      Marcar como pagado
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      isLoading={isPending}
                      onClick={() => startTransition(() => skipPaymentInstance(instance.id))}
                    >
                      Omitir este mes
                    </Button>
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ul>

      <Button
        type="button"
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-20 right-4 z-30 rounded-full px-5 shadow-md md:bottom-6"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Añadir pago fijo
      </Button>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Añadir pago fijo">
        <FixedPaymentForm
          action={createFixedPayment}
          categories={categories}
          onSuccess={() => setIsAddOpen(false)}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      <Modal isOpen={!!editingPayment} onClose={() => setEditingPayment(null)} title="Editar pago fijo">
        {editingPayment && (
          <FixedPaymentForm
            action={updateFixedPayment.bind(null, editingPayment.id)}
            categories={categories}
            payment={editingPayment}
            onSuccess={() => setEditingPayment(null)}
            onCancel={() => setEditingPayment(null)}
          />
        )}
      </Modal>

      <Modal isOpen={!!deletingPayment} onClose={() => setDeletingPayment(null)} title="Eliminar pago fijo">
        <p className="text-sm text-brown">¿Seguro que quieres eliminarlo?</p>
        <div className="mt-4 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setDeletingPayment(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            onClick={() =>
              startTransition(async () => {
                if (deletingPayment) await deleteFixedPayment(deletingPayment.id);
                setDeletingPayment(null);
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
