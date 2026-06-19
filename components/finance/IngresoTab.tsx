"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Plus, PencilSimple, Trash, CurrencyEur } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/format";
import {
  createIncomeSource,
  updateIncomeSource,
  deleteIncomeSource,
  type IncomeFormState,
} from "@/app/(app)/finanzas/incomeActions";
import type { IncomeSource } from "@/lib/types";

interface IngresoTabProps {
  sources: IncomeSource[];
}

const FREQUENCY_OPTIONS = [
  { value: "mensual", label: "Mensual" },
  { value: "quincenal", label: "Quincenal (cada 2 semanas)" },
  { value: "trimestral", label: "Trimestral" },
  { value: "anual", label: "Anual" },
];

const FREQUENCY_LABEL: Record<string, string> = {
  mensual: "mensual",
  quincenal: "quincenal",
  trimestral: "trimestral",
  anual: "anual",
};

function toMonthly(amount: number, frequency: string): number {
  if (frequency === "anual") return amount / 12;
  if (frequency === "trimestral") return amount / 3;
  if (frequency === "quincenal") return amount * 2;
  return amount;
}

function IncomeForm({
  action,
  source,
  onSuccess,
  onCancel,
}: {
  action: (prevState: IncomeFormState, formData: FormData) => Promise<IncomeFormState>;
  source?: IncomeSource;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [state, formAction, isPending] = useActionState(action, {});

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Concepto"
          name="name"
          required
          defaultValue={source?.name}
          error={state.fieldErrors?.name}
          placeholder="Ej. Nómina"
        />
        <Input
          label="Quién lo recibe"
          name="earnerName"
          defaultValue={source?.earner_name ?? undefined}
          placeholder="Ej. Andrew"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Importe (€)"
          name="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          required
          defaultValue={source?.amount ?? undefined}
          error={state.fieldErrors?.amount}
          placeholder="0,00"
        />
        <Select
          label="Frecuencia"
          name="frequency"
          defaultValue={source?.frequency ?? "mensual"}
          options={FREQUENCY_OPTIONS}
        />
      </div>
      <Input
        label="Día de cobro (opcional)"
        name="paymentDay"
        type="number"
        inputMode="numeric"
        min="1"
        max="31"
        defaultValue={source?.payment_day ?? undefined}
        placeholder="Ej. 25"
      />
      <Checkbox label="Activo" name="isActive" defaultChecked={source ? source.is_active : true} />
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

export function IngresoTab({ sources }: IngresoTabProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<IncomeSource | null>(null);
  const [deleting, setDeleting] = useState<IncomeSource | null>(null);

  const activeSources = sources.filter((s) => s.is_active);
  const totalMonthly = activeSources.reduce((sum, s) => sum + toMonthly(Number(s.amount), s.frequency), 0);
  const totalAnnual = totalMonthly * 12;

  const byEarner = activeSources.reduce<Record<string, IncomeSource[]>>((acc, s) => {
    const key = s.earner_name ?? "Sin asignar";
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-4">
      {sources.length === 0 ? (
        <EmptyState
          icon={CurrencyEur}
          title="Sin ingresos registrados."
          description="Añade aquí las nóminas, pensiones y cualquier ingreso fijo del hogar para ver el balance real mes a mes."
          action={
            <Button type="button" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              Añadir ingreso
            </Button>
          }
        />
      ) : (
        <>
          {/* Total summary */}
          <Card variant="subtle">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted">Total mensual neto</span>
              <span className="text-base font-bold text-sage tabular-nums">{formatCurrency(totalMonthly)}</span>
            </div>
            <div className="mt-1.5 h-px bg-border" />
            <div className="mt-1.5 flex items-center justify-between gap-4">
              <span className="text-sm text-muted">Total anual estimado</span>
              <span className="text-sm font-semibold text-brown tabular-nums">{formatCurrency(totalAnnual)}</span>
            </div>
          </Card>

          {/* Grouped by earner */}
          {Object.entries(byEarner).map(([earner, items]) => {
            const earnerTotal = items.reduce((sum, s) => sum + toMonthly(Number(s.amount), s.frequency), 0);
            return (
              <div key={earner} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">{earner}</p>
                  <p className="text-xs text-muted tabular-nums">{formatCurrency(earnerTotal)}/mes</p>
                </div>
                <ul className="flex flex-col gap-2">
                  {items.map((source) => (
                    <li key={source.id}>
                      <Card className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-brown">{source.name}</p>
                          <p className="text-xs text-muted">
                            {formatCurrency(source.amount)} · {FREQUENCY_LABEL[source.frequency]}
                            {source.frequency !== "mensual" && (
                              <span className="ml-1 text-muted/70">
                                (≈ {formatCurrency(toMonthly(Number(source.amount), source.frequency))}/mes)
                              </span>
                            )}
                            {source.payment_day && source.frequency !== "quincenal" && (
                              <span className="ml-1 text-muted/70">· día {source.payment_day}</span>
                            )}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            aria-label="Editar ingreso"
                            onClick={() => setEditing(source)}
                            className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:bg-white/[0.08] active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                          >
                            <PencilSimple className="h-4 w-4" aria-hidden />
                          </button>
                          <button
                            type="button"
                            aria-label="Eliminar ingreso"
                            onClick={() => setDeleting(source)}
                            className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:text-danger active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                          >
                            <Trash className="h-4 w-4" aria-hidden />
                          </button>
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* Inactive sources */}
          {sources.some((s) => !s.is_active) && (
            <details className="mt-1">
              <summary className="cursor-pointer text-xs text-muted/70 select-none">Inactivos</summary>
              <ul className="mt-2 flex flex-col gap-2">
                {sources.filter((s) => !s.is_active).map((source) => (
                  <li key={source.id}>
                    <Card className="flex items-center gap-3 opacity-50">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-brown">{source.name}</p>
                        <p className="text-xs text-muted">
                          {source.earner_name && `${source.earner_name} · `}
                          {formatCurrency(source.amount)} · {FREQUENCY_LABEL[source.frequency]} · Inactivo
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Editar ingreso"
                        onClick={() => setEditing(source)}
                        className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:bg-white/[0.08] active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                      >
                        <PencilSimple className="h-4 w-4" aria-hidden />
                      </button>
                    </Card>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      )}

      <Button type="button" onClick={() => setIsAddOpen(true)} className="mt-2 w-full">
        <Plus className="h-4 w-4" aria-hidden />
        Añadir ingreso
      </Button>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Añadir ingreso">
        <IncomeForm
          action={createIncomeSource}
          onSuccess={() => { setIsAddOpen(false); showToast("Ingreso añadido"); }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar ingreso">
        {editing && (
          <IncomeForm
            action={updateIncomeSource.bind(null, editing.id)}
            source={editing}
            onSuccess={() => { setEditing(null); showToast("Ingreso actualizado"); }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Eliminar ingreso">
        <p className="text-sm text-brown">
          ¿Seguro que quieres eliminar <strong>{deleting?.name}</strong>?
        </p>
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
                if (deleting) await deleteIncomeSource(deleting.id);
                setDeleting(null);
                showToast("Ingreso eliminado");
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
