"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { FinanceFormState } from "@/app/(app)/finanzas/actions";
import type { Category, Expense } from "@/lib/types";

const BANK_ACCOUNT_OPTIONS = [
  { value: "ING", label: "ING" },
  { value: "BBVA", label: "BBVA" },
  { value: "Revolut", label: "Revolut" },
];

interface Member {
  user_id: string;
  display_name: string | null;
}

interface ExpenseFormProps {
  action: (prevState: FinanceFormState, formData: FormData) => Promise<FinanceFormState>;
  categories: Category[];
  members: Member[];
  expense?: Expense;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialState: FinanceFormState = {};

export function ExpenseForm({ action, categories, members, expense, onSuccess, onCancel }: ExpenseFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Input label="Título" name="title" required defaultValue={expense?.title} error={state.fieldErrors?.title} />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Importe (€)"
          name="amount"
          type="number"
          step="0.01"
          required
          defaultValue={expense?.amount}
          error={state.fieldErrors?.amount}
        />
        <Input
          label="Fecha"
          name="expenseDate"
          type="date"
          required
          defaultValue={expense?.expense_date ?? new Date().toISOString().slice(0, 10)}
          error={state.fieldErrors?.expenseDate}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Categoría"
          name="categoryId"
          placeholder="Sin categoría"
          defaultValue={expense?.category_id ?? ""}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
        />
        <Select
          label="Cuenta bancaria"
          name="bankAccount"
          placeholder="Sin cuenta"
          defaultValue={expense?.bank_account ?? ""}
          options={BANK_ACCOUNT_OPTIONS}
        />
      </div>
      <Select
        label="Pagado por"
        name="paidBy"
        placeholder="Sin especificar"
        defaultValue={expense?.paid_by ?? ""}
        options={members.map((m) => ({ value: m.user_id, label: m.display_name ?? "Miembro" }))}
      />
      <Textarea label="Notas" name="notes" defaultValue={expense?.notes ?? undefined} />

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
