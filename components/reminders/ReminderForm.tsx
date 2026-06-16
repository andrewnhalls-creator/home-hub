"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { ReminderFormState } from "@/app/(app)/recordatorios/actions";
import type { Category, Reminder } from "@/lib/types";

interface Member {
  user_id: string;
  display_name: string | null;
}

interface ReminderFormProps {
  action: (prevState: ReminderFormState, formData: FormData) => Promise<ReminderFormState>;
  categories: Category[];
  members: Member[];
  reminder?: Reminder;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialState: ReminderFormState = {};

const REPEAT_OPTIONS = [
  { value: "ninguna", label: "Ninguna" },
  { value: "diaria", label: "Diaria" },
  { value: "semanal", label: "Semanal" },
  { value: "mensual", label: "Mensual" },
  { value: "anual", label: "Anual" },
];

export function ReminderForm({
  action,
  categories,
  members,
  reminder,
  onSuccess,
  onCancel,
}: ReminderFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  const dueAt = reminder?.due_at ? new Date(reminder.due_at) : null;
  const defaultDate = dueAt ? dueAt.toISOString().slice(0, 10) : "";
  const defaultTime = dueAt ? dueAt.toISOString().slice(11, 16) : "";

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Input
        label="Título"
        name="title"
        required
        defaultValue={reminder?.title}
        error={state.fieldErrors?.title}
      />
      <Textarea label="Descripción" name="description" defaultValue={reminder?.description ?? undefined} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Fecha límite" name="dueDate" type="date" defaultValue={defaultDate} />
        <Input label="Hora" name="dueTime" type="time" defaultValue={defaultTime} />
      </div>
      <Select
        label="Asignado a"
        name="assignedTo"
        placeholder="Sin asignar"
        defaultValue={reminder?.assigned_to ?? ""}
        options={members.map((member) => ({
          value: member.user_id,
          label: member.display_name ?? "Miembro",
        }))}
      />
      <Select
        label="Categoría"
        name="categoryId"
        placeholder="Sin categoría"
        defaultValue={reminder?.category_id ?? ""}
        options={categories.map((category) => ({ value: category.id, label: category.name }))}
      />
      <Select
        label="Repetición"
        name="repeatFrequency"
        defaultValue={reminder?.repeat_frequency ?? "ninguna"}
        options={REPEAT_OPTIONS}
      />

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
