"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Plus, Trash, PencilSimple, Scales } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/format";
import { createDebt, updateDebt, deleteDebt, type FinanceFormState } from "@/app/(app)/finanzas/actions";
import type { Debt } from "@/lib/types";

interface DeudaTabProps {
  debts: Debt[];
}

const initialState: FinanceFormState = {};

function DebtForm({
  action,
  debt,
  onSuccess,
  onCancel,
}: {
  action: (prevState: FinanceFormState, formData: FormData) => Promise<FinanceFormState>;
  debt?: Debt;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Input
        label="Nombre de la deuda"
        name="name"
        required
        defaultValue={debt?.name}
        error={state.fieldErrors?.name}
        placeholder="Ej. Préstamo coche"
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Saldo pendiente (€)"
          name="balance"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          required
          defaultValue={debt?.balance ?? undefined}
          error={state.fieldErrors?.balance}
          placeholder="0,00"
        />
        <Input
          label="Cuota mensual (€)"
          name="monthlyPayment"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          defaultValue={debt?.monthly_payment ?? undefined}
          placeholder="0,00"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Día de pago"
          name="paymentDay"
          type="number"
          inputMode="numeric"
          min="1"
          max="31"
          defaultValue={debt?.payment_day ?? undefined}
          placeholder="Ej. 15"
        />
        <Input
          label="Tipo de interés (%)"
          name="interestRate"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          max="100"
          defaultValue={debt?.interest_rate ?? undefined}
          placeholder="Ej. 3,50"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Entidad / prestamista"
          name="lender"
          defaultValue={debt?.lender ?? undefined}
          placeholder="Ej. BBVA"
        />
        <Input
          label="Fecha de inicio"
          name="startDate"
          type="date"
          defaultValue={debt?.start_date ?? undefined}
        />
      </div>
      <Textarea
        label="Notas"
        name="notes"
        defaultValue={debt?.notes ?? undefined}
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

export function DeudaTab({ debts }: DeudaTabProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);

  const totalBalance = debts.reduce((sum, d) => sum + Number(d.balance), 0);
  const totalMonthly = debts.reduce((sum, d) => sum + Number(d.monthly_payment ?? 0), 0);

  return (
    <div className="flex flex-col gap-4">
      {debts.length === 0 ? (
        <EmptyState
          icon={Scales}
          title="Sin deudas registradas."
          description="Apuntad aquí préstamos, hipotecas o tarjetas de crédito para hacer un seguimiento del saldo pendiente y las cuotas mensuales."
          action={
            <Button type="button" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              Añadir deuda
            </Button>
          }
        />
      ) : (
        <>
          {/* Summary */}
          <Card variant="subtle">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-muted">Deuda total</p>
                <p className="text-base font-bold text-danger tabular-nums">{formatCurrency(totalBalance)}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted">Cuota mensual total</p>
                <p className="text-base font-bold text-brown tabular-nums">{formatCurrency(totalMonthly)}</p>
              </div>
            </div>
          </Card>

          <ul className="flex flex-col gap-2">
            {debts.map((debt) => (
              <li key={debt.id}>
                <Card className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brown">{debt.name}</p>
                    <p className="text-xs text-muted">
                      {formatCurrency(debt.balance)} pendiente
                      {debt.monthly_payment ? ` · ${formatCurrency(debt.monthly_payment)}/mes` : ""}
                      {debt.interest_rate ? ` · ${debt.interest_rate}% TIN` : ""}
                      {debt.lender ? ` · ${debt.lender}` : ""}
                    </p>
                    {debt.payment_day && (
                      <p className="mt-0.5 text-xs text-muted/70">Pago el día {debt.payment_day}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      aria-label="Editar deuda"
                      onClick={() => setEditingDebt(debt)}
                      className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:bg-white/[0.08] active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                    >
                      <PencilSimple className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label="Eliminar deuda"
                      onClick={() => setDeletingDebt(debt)}
                      className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:text-danger active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                    >
                      <Trash className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      <Button type="button" onClick={() => setIsAddOpen(true)} className="mt-2 w-full">
        <Plus className="h-4 w-4" aria-hidden />
        Añadir deuda
      </Button>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Añadir deuda">
        <DebtForm
          action={createDebt}
          onSuccess={() => { setIsAddOpen(false); showToast("Deuda añadida"); }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      <Modal isOpen={!!editingDebt} onClose={() => setEditingDebt(null)} title="Editar deuda">
        {editingDebt && (
          <DebtForm
            action={updateDebt.bind(null, editingDebt.id)}
            debt={editingDebt}
            onSuccess={() => { setEditingDebt(null); showToast("Deuda actualizada"); }}
            onCancel={() => setEditingDebt(null)}
          />
        )}
      </Modal>

      <Modal isOpen={!!deletingDebt} onClose={() => setDeletingDebt(null)} title="Eliminar deuda">
        <p className="text-sm text-brown">
          ¿Seguro que quieres eliminar <strong>{deletingDebt?.name}</strong>?
        </p>
        <div className="mt-4 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setDeletingDebt(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            isLoading={isPending}
            onClick={() =>
              startTransition(async () => {
                if (deletingDebt) await deleteDebt(deletingDebt.id);
                setDeletingDebt(null);
                showToast("Deuda eliminada");
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
