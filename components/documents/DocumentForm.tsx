"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { DocumentFormState } from "@/app/(app)/documentos/actions";
import type { HouseholdDocument } from "@/lib/types";

interface DocumentFormProps {
  action: (prevState: DocumentFormState, formData: FormData) => Promise<DocumentFormState>;
  document?: HouseholdDocument;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialState: DocumentFormState = {};

export function DocumentForm({ action, document, onSuccess, onCancel }: DocumentFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Input label="Título" name="title" required defaultValue={document?.title} error={state.fieldErrors?.title} />
      <Input label="Tipo" name="documentType" defaultValue={document?.document_type ?? undefined} />
      <Input label="Proveedor" name="provider" defaultValue={document?.provider ?? undefined} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Fecha de caducidad" name="expiryDate" type="date" defaultValue={document?.expiry_date ?? undefined} />
        <Input label="Fecha de renovación" name="renewalDate" type="date" defaultValue={document?.renewal_date ?? undefined} />
      </div>
      <Input label="Enlace" name="storageUrl" type="url" defaultValue={document?.storage_url ?? undefined} />
      <Textarea label="Notas" name="notes" defaultValue={document?.notes ?? undefined} />

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
