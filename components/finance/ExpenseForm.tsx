"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { FinanceFormState } from "@/app/(app)/finanzas/actions";
import type { Category } from "@/lib/types";

interface Member {
  user_id: string;
  display_name: string | null;
}

interface ExpenseFormProps {
  action: (prevState: FinanceFormState, formData: FormData) => Promise<FinanceFormState>;
  categories: Category[];
  members: Member[];
  onSuccess: () => void;
  onCancel: () => void;
}

const initialState: FinanceFormState = {};

export function ExpenseForm({ action, categories, members, onSuccess, onCancel }: ExpenseFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Input label="Título" name="title" required error={state.fieldErrors?.title} />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Importe (€)"
          name="amount"
          type="number"
          step="0.01"
          required
          error={state.fieldErrors?.amount}
        />
        <Input
          label="Fecha"
          name="expenseDate"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          error={state.fieldErrors?.expenseDate}
        />
      </div>
      <Select
        label="Categoría"
        name="categoryId"
        placeholder="Sin categoría"
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
      />
      <Select
        label="Pagado por"
        name="paidBy"
        placeholder="Sin especificar"
        options={members.map((m) => ({ value: m.user_id, label: m.display_name ?? "Miembro" }))}
      />
      <Textarea label="Notas" name="notes" />

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
