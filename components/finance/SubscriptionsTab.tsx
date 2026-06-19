"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { isBefore, addDays, parseISO, format } from "date-fns";
import { Plus, Trash, ArrowCounterClockwise } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/format";
import { getSubscriptionCycleStatus } from "@/lib/cycle";
import { createSubscription, deleteSubscription, type FinanceFormState } from "@/app/(app)/finanzas/actions";
import type { Category, Subscription } from "@/lib/types";

interface SubscriptionsTabProps {
  subscriptions: Subscription[];
  categories: Category[];
}

const initialState: FinanceFormState = {};

const BILLING_OPTIONS = [
  { value: "mensual", label: "Mensual" },
  { value: "trimestral", label: "Trimestral" },
  { value: "anual", label: "Anual" },
  { value: "otro", label: "Otro (personalizado)" },
];

function AddSubscriptionForm({
  categories,
  onSuccess,
  onCancel,
}: {
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [state, formAction, isPending] = useActionState(createSubscription, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Input label="Nombre" name="name" required error={state.fieldErrors?.name} />
      <Input label="Importe (€)" name="amount" type="number" step="0.01" required error={state.fieldErrors?.amount} />
      <Select label="Ciclo de facturación" name="billingCycle" defaultValue="mensual" options={BILLING_OPTIONS} />
      <Input label="Fecha de renovación" name="renewalDate" type="date" />
      <Select
        label="Categoría"
        name="categoryId"
        placeholder="Sin categoría"
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
      />
      <Checkbox label="Activa" name="isActive" defaultChecked />
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

export function SubscriptionsTab({ subscriptions, categories }: SubscriptionsTabProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleting, setDeleting] = useState<Subscription | null>(null);

  const soonThreshold = addDays(new Date(), 14);

  const monthly = subscriptions.filter((s) => s.billing_cycle === "mensual");
  const annual = subscriptions.filter((s) => s.billing_cycle === "anual");
  const other = subscriptions.filter((s) => s.billing_cycle === "trimestral" || s.billing_cycle === "otro");

  const monthlyTotal = monthly.filter((s) => s.is_active).reduce((sum, s) => sum + Number(s.amount), 0);
  const annualTotal = annual.filter((s) => s.is_active).reduce((sum, s) => sum + Number(s.amount), 0);

  function SubscriptionItem({ subscription }: { subscription: Subscription }) {
    const renewsSoon =
      subscription.renewal_date && isBefore(new Date(subscription.renewal_date), soonThreshold);

    // Future-start badge (e.g. Google One not active yet)
    const hasFutureStart =
      !subscription.is_active &&
      subscription.start_date &&
      new Date(subscription.start_date) > new Date();
    const futureStartLabel = hasFutureStart && subscription.start_date
      ? `Disponible desde ${format(parseISO(subscription.start_date), "MMM yyyy")}`
      : null;

    // Paid/pending chip for monthly subs with a known billing_day
    let cycleChip: "pagado" | "pendiente" | null = null;
    if (
      subscription.billing_cycle === "mensual" &&
      subscription.is_active &&
      !hasFutureStart &&
      subscription.billing_day != null
    ) {
      cycleChip = getSubscriptionCycleStatus(subscription.billing_day);
    }

    // Renewal info for custom-interval subs
    const renewalLabel =
      subscription.billing_cycle === "otro" && subscription.renewal_date
        ? `Próxima renovación: ${formatDate(subscription.renewal_date)}`
        : null;

    return (
      <li>
        <Card className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-brown">{subscription.name}</p>
            <p className="text-xs text-muted">
              {formatCurrency(subscription.amount)}
              {renewalLabel
                ? ` · ${renewalLabel}`
                : subscription.renewal_date && !hasFutureStart && subscription.billing_cycle !== "mensual"
                ? ` · ${formatDate(subscription.renewal_date)}`
                : ""}
            </p>
          </div>
          {futureStartLabel && <Badge variant="neutral">{futureStartLabel}</Badge>}
          {cycleChip === "pagado" && <Badge variant="success">Pagado</Badge>}
          {cycleChip === "pendiente" && <Badge variant="warning">Pendiente</Badge>}
          {!cycleChip && !futureStartLabel && renewsSoon && <Badge variant="warning">Se renueva pronto</Badge>}
          <button
            type="button"
            aria-label="Eliminar suscripción"
            onClick={() => setDeleting(subscription)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:text-danger active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
          >
            <Trash className="h-4 w-4" aria-hidden />
          </button>
        </Card>
      </li>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {subscriptions.length === 0 ? (
        <EmptyState
          icon={ArrowCounterClockwise}
          title="Sin suscripciones todavía."
          description="Apuntad lo que pagáis recurrentemente — plataformas, gimnasio, servicios — y controlad cuánto suma al mes."
          action={
            <Button type="button" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              Añadir suscripción
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-5">
          {monthly.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Mensuales</p>
                <p className="text-xs text-muted tabular-nums">{formatCurrency(monthlyTotal)}/mes</p>
              </div>
              <ul className="flex flex-col gap-2">
                {monthly.map((s) => <SubscriptionItem key={s.id} subscription={s} />)}
              </ul>
            </div>
          )}
          {annual.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Anuales</p>
                <p className="text-xs text-muted tabular-nums">{formatCurrency(annualTotal)}/año</p>
              </div>
              <ul className="flex flex-col gap-2">
                {annual.map((s) => <SubscriptionItem key={s.id} subscription={s} />)}
              </ul>
            </div>
          )}
          {other.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Otros ciclos</p>
              <ul className="flex flex-col gap-2">
                {other.map((s) => <SubscriptionItem key={s.id} subscription={s} />)}
              </ul>
            </div>
          )}
        </div>
      )}

      <Button
        type="button"
        onClick={() => setIsAddOpen(true)}
        className="mt-4 w-full"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Añadir suscripción
      </Button>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Añadir suscripción">
        <AddSubscriptionForm categories={categories} onSuccess={() => { setIsAddOpen(false); showToast("Suscripción añadida"); }} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Eliminar suscripción">
        <p className="text-sm text-brown">¿Seguro que quieres eliminarlo?</p>
        <div className="mt-4 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setDeleting(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            isLoading={isPending}
            onClick={() =>
              startTransition(async () => {
                if (deleting) await deleteSubscription(deleting.id);
                setDeleting(null);
                showToast("Suscripción eliminada");
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
