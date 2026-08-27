"use client";

import { ACCOUNT_OPTIONS } from "@/lib/constants";
import { useActionState, useEffect, useState } from "react";
import { PencilSimple } from "@phosphor-icons/react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { FinanceFormState } from "@/app/(app)/finanzas/actions";
import type { Category, Expense } from "@/lib/types";

const BANK_ACCOUNT_OPTIONS = ACCOUNT_OPTIONS;

const CHIP_ACCENTS = [
  "bg-amber text-cream",
  "bg-sage text-cream",
  "bg-olive text-cream",
  "bg-rose text-cream",
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
  const [paidBy, setPaidBy] = useState<string>(expense?.paid_by ?? "");

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      {/* Amount — hero input */}
      <div className="flex flex-col items-center gap-1 py-2">
        <label htmlFor="expense-amount" className="text-xs font-semibold uppercase tracking-wider text-muted">
          Importe
        </label>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-terracotta" aria-hidden>€</span>
          <input
            id="expense-amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="0,00"
            required
            defaultValue={expense?.amount}
            aria-invalid={!!state.fieldErrors?.amount}
            className="w-40 border-none bg-transparent text-center text-4xl font-bold tabular-nums text-brown placeholder:text-muted/40 focus:outline-none"
          />
        </div>
        {state.fieldErrors?.amount && (
          <p className="text-xs text-danger">{state.fieldErrors.amount}</p>
        )}
      </div>

      <Input
        label="Descripción"
        name="title"
        placeholder="Ej. Mercadona"
        icon={PencilSimple}
        required
        defaultValue={expense?.title}
        error={state.fieldErrors?.title}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Fecha"
          name="expenseDate"
          type="date"
          required
          defaultValue={expense?.expense_date ?? new Date().toISOString().slice(0, 10)}
          error={state.fieldErrors?.expenseDate}
        />
        <Select
          label="Categoría"
          name="categoryId"
          placeholder="Selecciona"
          defaultValue={expense?.category_id ?? ""}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
        />
      </div>

      {/* ¿Quién pagó? — member chips */}
      {members.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-brown">¿Quién pagó?</p>
          <input type="hidden" name="paidBy" value={paidBy} />
          <div role="radiogroup" aria-label="¿Quién pagó?" className="flex flex-wrap gap-2">
            {members.map((member, index) => {
              const name = member.display_name ?? "Miembro";
              const isSelected = paidBy === member.user_id;
              return (
                <button
                  key={member.user_id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setPaidBy(isSelected ? "" : member.user_id)}
                  className={cn(
                    "flex min-h-[40px] items-center gap-2 rounded-full border py-1 pl-1.5 pr-3.5 text-sm font-medium transition active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
                    isSelected
                      ? "border-transparent bg-amber/20 text-brown ring-1 ring-amber"
                      : "border-border bg-card text-brown hover:bg-sand",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                      CHIP_ACCENTS[index % CHIP_ACCENTS.length],
                    )}
                    aria-hidden
                  >
                    {name.charAt(0).toUpperCase()}
                  </span>
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Select
        label="Cuenta / Etiqueta"
        name="bankAccount"
        placeholder="Sin cuenta"
        defaultValue={expense?.bank_account ?? ""}
        options={BANK_ACCOUNT_OPTIONS}
      />
      <Textarea label="Notas" name="notes" defaultValue={expense?.notes ?? undefined} />

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <div className="mt-2 flex flex-col gap-2.5">
        <Button type="submit" isLoading={isPending}>
          Guardar gasto
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
