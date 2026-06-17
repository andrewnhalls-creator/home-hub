"use client";

import { useActionState, useEffect } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { MortgageFormState } from "@/app/(app)/finanzas/mortgageActions";
import type { Mortgage } from "@/lib/types";

interface MortgagePaymentFormProps {
  action: (prevState: MortgageFormState, formData: FormData) => Promise<MortgageFormState>;
  mortgage: Mortgage;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialState: MortgageFormState = {};

const STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "pagado", label: "Pagado" },
  { value: "omitido", label: "Omitido" },
];

export function MortgagePaymentForm({ action, mortgage, onSuccess, onCancel }: MortgagePaymentFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const todayStr = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="mortgageId" value={mortgage.id} />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Fecha prevista"
          name="dueDate"
          type="date"
          required
          defaultValue={todayStr}
          error={state.fieldErrors?.dueDate}
        />
        <Input
          label="Fecha de pago"
          name="paidDate"
          type="date"
          defaultValue={todayStr}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Importe total (€)"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={mortgage.monthly_payment}
          error={state.fieldErrors?.amount}
          placeholder="0,00"
        />
        <Select
          label="Estado"
          name="status"
          defaultValue="pagado"
          options={STATUS_OPTIONS}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Capital amortizado (€)"
          name="principalAmount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0,00"
        />
        <Input
          label="Intereses (€)"
          name="interestAmount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0,00"
        />
      </div>

      <Input
        label="Pago extra (€)"
        name="extraPayment"
        type="number"
        step="0.01"
        min="0"
        placeholder="0,00"
      />

      <Textarea label="Notas" name="notes" />

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <div className="mt-2 flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "Guardando…" : "Registrar pago"}
        </Button>
      </div>
    </form>
  );
}
