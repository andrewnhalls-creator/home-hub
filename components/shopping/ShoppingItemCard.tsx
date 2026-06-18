"use client";

import { useState, useTransition } from "react";
import { Circle, CheckCircle, PencilSimple, Trash } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { Category, ShoppingItem } from "@/lib/types";
import { toggleShoppingItemComplete, deleteShoppingItem } from "@/app/(app)/compra/actions";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useOfflineToggleQueue } from "@/hooks/useOfflineToggleQueue";

interface ShoppingItemCardProps {
  item: ShoppingItem;
  category?: Category;
  membersById?: Map<string, string>;
  onEdit: () => void;
}

export function ShoppingItemCard({ item, category, membersById, onEdit }: ShoppingItemCardProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [localCompleted, setLocalCompleted] = useState(item.is_completed);
  const isOnline = useOnlineStatus();
  const { enqueue } = useOfflineToggleQueue(isOnline);

  const meta = [
    item.quantity ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""}` : null,
    category?.name,
    item.store,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <Card className={cn("flex items-start gap-3 transition-opacity duration-300", localCompleted && "opacity-60")}>
        <button
          type="button"
          aria-label={localCompleted ? "Volver a pendiente" : "Marcar como comprado"}
          disabled={isPending}
          onClick={() => {
            const next = !localCompleted;
            setLocalCompleted(next);
            if (!isOnline) {
              enqueue(item.id, next);
            } else {
              startTransition(() => toggleShoppingItemComplete(item.id, next));
            }
          }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-terracotta transition active:scale-[0.85] active:bg-terracotta/10 disabled:opacity-50"
        >
          {localCompleted ? (
            <CheckCircle className="h-6 w-6" aria-hidden />
          ) : (
            <Circle className="h-6 w-6" aria-hidden />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-medium text-brown",
              localCompleted && "text-muted line-through",
            )}
          >
            {item.name}
          </p>
          {meta && <p className="text-xs text-muted">{meta}</p>}
          {item.notes && <p className="mt-1 text-xs text-muted">{item.notes}</p>}
          {membersById && membersById.size > 1 && !localCompleted && item.created_by && membersById.get(item.created_by) && (
            <p className="mt-0.5 text-xs text-muted/70">Añadido por {membersById.get(item.created_by)}</p>
          )}
          {localCompleted && item.completed_by && membersById?.get(item.completed_by) && (
            <p className="mt-0.5 text-xs text-muted/70">Cogido por {membersById.get(item.completed_by)}</p>
          )}
        </div>

        {item.priority !== "normal" && (
          <Badge variant={item.priority === "alta" ? "danger" : "neutral"}>
            {item.priority === "alta" ? "Alta" : "Baja"}
          </Badge>
        )}

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            aria-label="Editar producto"
            onClick={onEdit}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:bg-sand active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
          >
            <PencilSimple className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Eliminar producto"
            onClick={() => setIsConfirmingDelete(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:bg-sand active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
          >
            <Trash className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </Card>

      <Modal
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        title="Eliminar producto"
      >
        <p className="text-sm text-brown">¿Seguro que quieres eliminarlo?</p>
        <div className="mt-4 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => setIsConfirmingDelete(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            onClick={() =>
              startTransition(async () => {
                await deleteShoppingItem(item.id);
                setIsConfirmingDelete(false);
                showToast("Producto eliminado");
              })
            }
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </>
  );
}
