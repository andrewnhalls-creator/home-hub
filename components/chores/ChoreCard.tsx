"use client";

import { useState, useTransition } from "react";
import { isPast } from "date-fns";
import { Circle, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { Chore } from "@/lib/types";
import { completeChore, deleteChore } from "@/app/(app)/tareas/actions";

interface ChoreCardProps {
  chore: Chore;
  assignedName?: string;
  onEdit: () => void;
}

export function ChoreCard({ chore, assignedName, onEdit }: ChoreCardProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isDone = chore.status === "hecho";
  const isOverdue = !isDone && chore.next_due_date && isPast(new Date(`${chore.next_due_date}T23:59:59`));

  return (
    <>
      <Card className="flex items-start gap-3">
        <button
          type="button"
          aria-label="Marcar como hecho"
          disabled={isPending || isDone}
          onClick={() => startTransition(() => completeChore(chore.id))}
          className="mt-0.5 text-terracotta disabled:opacity-50"
        >
          {isDone ? <CheckCircle2 className="h-6 w-6" aria-hidden /> : <Circle className="h-6 w-6" aria-hidden />}
        </button>

        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-medium text-brown", isDone && "text-muted line-through")}>
            {chore.title}
          </p>
          <p className="text-xs text-muted">
            {[chore.next_due_date ? formatDate(chore.next_due_date) : null, assignedName]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {chore.description && <p className="mt-1 text-xs text-muted">{chore.description}</p>}
        </div>

        {!isDone && <Badge variant={isOverdue ? "danger" : "neutral"}>{isOverdue ? "Vencido" : "Pendiente"}</Badge>}

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            aria-label="Editar tarea"
            onClick={onEdit}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-sand"
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Eliminar tarea"
            onClick={() => setIsConfirmingDelete(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-sand"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </Card>

      <Modal isOpen={isConfirmingDelete} onClose={() => setIsConfirmingDelete(false)} title="Eliminar tarea">
        <p className="text-sm text-brown">¿Seguro que quieres eliminarlo?</p>
        <div className="mt-4 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsConfirmingDelete(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            onClick={() =>
              startTransition(async () => {
                await deleteChore(chore.id);
                setIsConfirmingDelete(false);
                showToast("Tarea eliminada");
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
