"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { MortgageFormState } from "@/app/(app)/finanzas/mortgageActions";
import type { Mortgage } from "@/lib/types";

interface MortgageFormProps {
  action: (prevState: MortgageFormState, formData: FormData) => Promise<MortgageFormState>;
  mortgage?: Mortgage;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialState: MortgageFormState = {};

export function MortgageForm({ action, mortgage, onSuccess, onCancel }: MortgageFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      {mortgage && <input type="hidden" name="id" value={mortgage.id} />}

      <Input
        label="Nombre de la hipoteca"
        name="name"
        required
        defaultValue={mortgage?.name ?? "Hipoteca"}
        error={state.fieldErrors?.name}
        placeholder="Ej. Hipoteca piso"
      />
      <Input
        label="Banco / entidad"
        name="lender"
        defaultValue={mortgage?.lender ?? undefined}
        placeholder="Ej. Banco Santander"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Capital inicial (€)"
          name="originalPrincipal"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={mortgage?.original_principal ?? undefined}
          error={state.fieldErrors?.originalPrincipal}
          placeholder="0,00"
        />
        <Input
          label="Saldo pendiente (€)"
          name="currentBalance"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={mortgage?.current_balance ?? undefined}
          error={state.fieldErrors?.currentBalance}
          placeholder="0,00"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Cuota mensual (€)"
          name="monthlyPayment"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={mortgage?.monthly_payment ?? undefined}
          error={state.fieldErrors?.monthlyPayment}
          placeholder="0,00"
        />
        <Input
          label="Tipo de interés (%)"
          name="interestRate"
          type="number"
          step="0.001"
          min="0"
          max="100"
          defaultValue={mortgage?.interest_rate ?? undefined}
          placeholder="0,000"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Fecha de inicio"
          name="startDate"
          type="date"
          defaultValue={mortgage?.start_date ?? undefined}
        />
        <Input
          label="Fecha de vencimiento"
          name="endDate"
          type="date"
          defaultValue={mortgage?.end_date ?? undefined}
        />
      </div>

      <Input
        label="Día de pago (1–31)"
        name="paymentDay"
        type="number"
        min="1"
        max="31"
        defaultValue={mortgage?.payment_day ?? undefined}
        placeholder="Ej. 5"
      />

      <Textarea
        label="Notas"
        name="notes"
        defaultValue={mortgage?.notes ?? undefined}
        placeholder="Condiciones especiales, carencias, etc."
      />

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <div className="mt-2 flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "Guardando…" : mortgage ? "Guardar cambios" : "Añadir hipoteca"}
        </Button>
      </div>
    </form>
  );
}
