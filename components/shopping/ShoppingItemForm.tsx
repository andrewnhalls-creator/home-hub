"use client";

import { useActionState, useEffect } from "react";
import type { ShoppingFormState } from "@/app/(app)/compra/actions";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { Category, ShoppingItem } from "@/lib/types";

interface ShoppingItemFormProps {
  action: (prevState: ShoppingFormState, formData: FormData) => Promise<ShoppingFormState>;
  categories: Category[];
  item?: ShoppingItem;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialState: ShoppingFormState = {};

const PRIORITY_OPTIONS = [
  { value: "baja", label: "Baja" },
  { value: "normal", label: "Normal" },
  { value: "alta", label: "Alta" },
];

export function ShoppingItemForm({
  action,
  categories,
  item,
  onSuccess,
  onCancel,
}: ShoppingItemFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="Producto"
        name="name"
        required
        defaultValue={item?.name}
        error={state.fieldErrors?.name}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Cantidad"
          name="quantity"
          type="number"
          step="any"
          defaultValue={item?.quantity ?? undefined}
          error={state.fieldErrors?.quantity}
        />
        <Input label="Unidad" name="unit" defaultValue={item?.unit ?? undefined} />
      </div>
      <Select
        label="Categoría"
        name="categoryId"
        placeholder="Sin categoría"
        defaultValue={item?.category_id ?? ""}
        options={categories.map((category) => ({ value: category.id, label: category.name }))}
      />
      <Input label="Tienda" name="store" defaultValue={item?.store ?? undefined} />
      <Select
        label="Prioridad"
        name="priority"
        defaultValue={item?.priority ?? "normal"}
        options={PRIORITY_OPTIONS}
      />
      <Textarea label="Notas" name="notes" defaultValue={item?.notes ?? undefined} />

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
