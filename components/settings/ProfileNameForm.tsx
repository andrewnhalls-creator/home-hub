"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProfileDisplayName, type SettingsActionState } from "@/app/(app)/ajustes/actions";

const initialState: SettingsActionState = {};

interface ProfileNameFieldsProps {
  displayName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function ProfileNameFields({ displayName, onSuccess, onCancel }: ProfileNameFieldsProps) {
  const [state, formAction, isPending] = useActionState(updateProfileDisplayName, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-3">
      <Input
        label="Tu nombre"
        name="displayName"
        defaultValue={displayName}
        required
        error={state.fieldErrors?.displayName}
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

interface ProfileNameFormProps {
  displayName: string;
}

export function ProfileNameForm({ displayName }: ProfileNameFormProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-base text-brown">{displayName || "Sin nombre"}</p>
        <button
          type="button"
          aria-label="Editar tu nombre"
          onClick={() => setIsEditing(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-sand active:bg-sand"
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <ProfileNameFields
      displayName={displayName}
      onSuccess={() => setIsEditing(false)}
      onCancel={() => setIsEditing(false)}
    />
  );
}
