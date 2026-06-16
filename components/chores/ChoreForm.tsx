"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { ChoreFormState } from "@/app/(app)/tareas/actions";
import type { Chore } from "@/lib/types";

interface Member {
  user_id: string;
  display_name: string | null;
}

interface ChoreFormProps {
  action: (prevState: ChoreFormState, formData: FormData) => Promise<ChoreFormState>;
  members: Member[];
  chore?: Chore;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialState: ChoreFormState = {};

const FREQUENCY_OPTIONS = [
  { value: "puntual", label: "Puntual" },
  { value: "diaria", label: "Diaria" },
  { value: "semanal", label: "Semanal" },
  { value: "quincenal", label: "Quincenal" },
  { value: "mensual", label: "Mensual" },
];

export function ChoreForm({ action, members, chore, onSuccess, onCancel }: ChoreFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Input
        label="Título"
        name="title"
        required
        defaultValue={chore?.title}
        error={state.fieldErrors?.title}
      />
      <Textarea label="Descripción" name="description" defaultValue={chore?.description ?? undefined} />
      <Select
        label="Asignado a"
        name="assignedTo"
        placeholder="Sin asignar"
        defaultValue={chore?.assigned_to ?? ""}
        options={members.map((member) => ({
          value: member.user_id,
          label: member.display_name ?? "Miembro",
        }))}
      />
      <Select
        label="Frecuencia"
        name="frequency"
        defaultValue={chore?.frequency ?? "puntual"}
        options={FREQUENCY_OPTIONS}
      />
      <Input label="Próxima fecha" name="nextDueDate" type="date" defaultValue={chore?.next_due_date ?? undefined} />

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
