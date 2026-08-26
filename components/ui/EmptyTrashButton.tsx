"use client";

import { useState, useTransition } from "react";
import { Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { emptyTrash } from "@/app/(app)/papelera/actions";

export function EmptyTrashButton() {
  const { showToast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await emptyTrash();
      setIsConfirming(false);
      if (result.error) {
        showToast(result.error, "error");
        return;
      }
      showToast(
        result.purged === 1
          ? "Se ha eliminado 1 elemento definitivamente."
          : `Se han eliminado ${result.purged ?? 0} elementos definitivamente.`,
      );
    });
  }

  return (
    <>
      <Button type="button" variant="danger" onClick={() => setIsConfirming(true)}>
        <Trash className="h-4 w-4" aria-hidden />
        Vaciar papelera
      </Button>

      <Modal
        isOpen={isConfirming}
        onClose={() => setIsConfirming(false)}
        title="¿Vaciar la papelera?"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            Se eliminarán definitivamente todos los elementos de la papelera,
            incluidos sus movimientos en Finanzas. Esta acción no se puede
            deshacer.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setIsConfirming(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="danger" onClick={handleConfirm} isLoading={isPending}>
              Vaciar definitivamente
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
