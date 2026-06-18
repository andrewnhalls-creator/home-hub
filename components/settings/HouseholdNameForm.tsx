"use client";

import { useActionState, useEffect, useState } from "react";
import { PencilSimple } from "@phosphor-icons/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateHouseholdName, type SettingsActionState } from "@/app/(app)/ajustes/actions";

const initialState: SettingsActionState = {};

interface HouseholdNameFieldsProps {
  name: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function HouseholdNameFields({ name, onSuccess, onCancel }: HouseholdNameFieldsProps) {
  const [state, formAction, isPending] = useActionState(updateHouseholdName, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-3">
      <Input
        label="Nombre del hogar"
        name="name"
        defaultValue={name}
        required
        error={state.fieldErrors?.name}
      />
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="flex gap-3">
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

interface HouseholdNameFormProps {
  name: string;
  canEdit: boolean;
}

export function HouseholdNameForm({ name, canEdit }: HouseholdNameFormProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!canEdit) {
    return <p className="text-base text-brown">{name}</p>;
  }

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-base text-brown">{name}</p>
        <button
          type="button"
          aria-label="Editar nombre del hogar"
          onClick={() => setIsEditing(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:bg-sand active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
        >
          <PencilSimple className="h-4 w-4" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <HouseholdNameFields
      name={name}
      onSuccess={() => setIsEditing(false)}
      onCancel={() => setIsEditing(false)}
    />
  );
}
