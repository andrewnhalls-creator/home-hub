"use client";

import { useActionState, useEffect, useMemo } from "react";
import { format, startOfWeek } from "date-fns";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createShoppingList, type ShoppingListFormState } from "@/app/(app)/compra/listas/actions";

const initialState: ShoppingListFormState = {};

export function ShoppingListForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [state, formAction, isPending] = useActionState(createShoppingList, initialState);
  const weekPlaceholder = useMemo(() => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    return `Semana del ${format(monday, "dd/MM")}`;
  }, []);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Input
        label="Nombre"
        name="name"
        required
        placeholder={weekPlaceholder}
        error={state.fieldErrors?.name}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Inicio de semana" name="weekStartDate" type="date" />
        <Input label="Fin de semana" name="weekEndDate" type="date" />
      </div>
      <Input label="Presupuesto previsto (€)" name="plannedBudget" type="number" step="0.01" error={state.fieldErrors?.plannedBudget} />
      <Input label="Tienda principal" name="mainStore" />

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
