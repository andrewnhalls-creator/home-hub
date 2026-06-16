"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import type { FinanceFormState } from "@/app/(app)/finanzas/actions";
import type { Category, FixedPayment } from "@/lib/types";

interface FixedPaymentFormProps {
  action: (prevState: FinanceFormState, formData: FormData) => Promise<FinanceFormState>;
  categories: Category[];
  payment?: FixedPayment;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialState: FinanceFormState = {};

export function FixedPaymentForm({ action, categories, payment, onSuccess, onCancel }: FixedPaymentFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Input label="Nombre" name="name" required defaultValue={payment?.name} error={state.fieldErrors?.name} />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Importe (€)"
          name="amount"
          type="number"
          step="0.01"
          required
          defaultValue={payment?.amount}
          error={state.fieldErrors?.amount}
        />
        <Input label="Día de cobro" name="dueDay" type="number" min={1} max={31} defaultValue={payment?.due_day ?? undefined} />
      </div>
      <Select
        label="Categoría"
        name="categoryId"
        placeholder="Sin categoría"
        defaultValue={payment?.category_id ?? ""}
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
      />
      <Input label="Método de pago" name="paymentMethod" defaultValue={payment?.payment_method ?? undefined} />
      <Checkbox label="Activo" name="isActive" defaultChecked={payment?.is_active ?? true} />
      <Textarea label="Notas" name="notes" defaultValue={payment?.notes ?? undefined} />

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
