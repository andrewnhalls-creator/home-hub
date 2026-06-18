"use client";

import { useState, useTransition } from "react";
import { Trash } from "@phosphor-icons/react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { deleteRecipe } from "@/app/(app)/menu/recetas/actions";

export function RecipeDeleteButton({ recipeId }: { recipeId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <Button type="button" variant="danger" onClick={() => setIsOpen(true)}>
        <Trash className="h-4 w-4" aria-hidden />
        Eliminar receta
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Eliminar receta">
        <p className="text-sm text-brown">¿Seguro que quieres eliminarlo?</p>
        <div className="mt-4 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            isLoading={isPending}
            onClick={() => startTransition(() => deleteRecipe(recipeId))}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </>
  );
}
