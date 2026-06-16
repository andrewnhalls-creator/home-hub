"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { WishlistFormState } from "@/app/(app)/deseos/actions";
import type { WishlistItem } from "@/lib/types";

interface WishlistItemFormProps {
  action: (prevState: WishlistFormState, formData: FormData) => Promise<WishlistFormState>;
  item?: WishlistItem;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialState: WishlistFormState = {};

const PRIORITY_OPTIONS = [
  { value: "baja", label: "Baja" },
  { value: "normal", label: "Normal" },
  { value: "alta", label: "Alta" },
];

const STATUS_OPTIONS = [
  { value: "idea", label: "Idea" },
  { value: "aprobado", label: "Aprobado" },
  { value: "comprado", label: "Comprado" },
  { value: "descartado", label: "Descartado" },
];

export function WishlistItemForm({ action, item, onSuccess, onCancel }: WishlistItemFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Input label="Nombre" name="name" required defaultValue={item?.name} error={state.fieldErrors?.name} />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Coste estimado (€)"
          name="estimatedCost"
          type="number"
          step="0.01"
          defaultValue={item?.estimated_cost ?? undefined}
          error={state.fieldErrors?.estimatedCost}
        />
        <Input label="Mes objetivo" name="targetMonth" type="month" defaultValue={item?.target_month?.slice(0, 7) ?? undefined} />
      </div>
      <Select label="Prioridad" name="priority" defaultValue={item?.priority ?? "normal"} options={PRIORITY_OPTIONS} />
      <Select label="Estado" name="status" defaultValue={item?.status ?? "idea"} options={STATUS_OPTIONS} />
      <Input label="Enlace" name="url" type="url" defaultValue={item?.url ?? undefined} />
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
