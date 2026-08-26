"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { isPast } from "date-fns";
import { Check, ArrowsClockwise, PencilSimple, Trash, Clock, CalendarBlank } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { Chore } from "@/lib/types";
import { completeChore, deleteChore, snoozeChore } from "@/app/(app)/tareas/actions";

interface ChoreCardProps {
  chore: Chore;
  assignedName?: string;
  onEdit: () => void;
}

export function ChoreCard({ chore, assignedName, onEdit }: ChoreCardProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false);

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
          className="flex h-11 w-11 shrink-0 items-center justify-center disabled:opacity-70"
        >
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md border-2 transition active:scale-[0.85]",
              isDone ? "border-sage bg-sage text-cream" : "border-border bg-card",
              isOverdue && !isDone && "border-danger/50",
            )}
            aria-hidden
          >
            {isDone && <Check weight="bold" size={14} />}
          </span>
        </button>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className={cn("text-sm font-semibold text-brown", isDone && "font-medium text-muted line-through")}>
            {chore.title}
          </p>
          {(chore.next_due_date || chore.frequency) && (
            <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted">
              {chore.next_due_date && (
                <span className="flex items-center gap-1">
                  <CalendarBlank size={12} aria-hidden />
                  {formatDate(chore.next_due_date)}
                </span>
              )}
              {chore.next_due_date && chore.frequency && <span aria-hidden>·</span>}
              {chore.frequency && (
                <span className="flex items-center gap-1 capitalize">
                  <ArrowsClockwise size={12} aria-hidden />
                  {chore.frequency}
                </span>
              )}
            </p>
          )}
          {chore.description && <p className="mt-1 text-xs text-muted">{chore.description}</p>}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {assignedName && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-olive/10 py-0.5 pl-1 pr-2.5 text-xs font-medium text-olive">
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-olive text-[9px] font-bold text-cream"
                  aria-hidden
                >
                  {assignedName.charAt(0).toUpperCase()}
                </span>
                {assignedName}
              </span>
            )}
            <Link
              href={`/tareas/${chore.id}`}
              className="inline-block text-xs text-terracotta hover:underline"
            >
              Ver historial
            </Link>
          </div>
        </div>

        {isOverdue && <Badge variant="danger">Atrasado</Badge>}

        <div className="flex shrink-0 gap-1">
          {!isDone && (
            <button
              type="button"
              aria-label="Posponer"
              onClick={() => setIsSnoozeOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:bg-sand active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
            >
              <Clock className="h-4 w-4" aria-hidden />
            </button>
          )}
          <button
            type="button"
            aria-label="Editar tarea"
            onClick={onEdit}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:bg-sand active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
          >
            <PencilSimple className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Eliminar tarea"
            onClick={() => setIsConfirmingDelete(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:bg-sand active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
          >
            <Trash className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </Card>

      <Modal isOpen={isSnoozeOpen} onClose={() => setIsSnoozeOpen(false)} title="Posponer tarea">
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              startTransition(async () => {
                await snoozeChore(chore.id, 1);
                setIsSnoozeOpen(false);
              })
            }
          >
            Mañana
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              startTransition(async () => {
                await snoozeChore(chore.id, 3);
                setIsSnoozeOpen(false);
              })
            }
          >
            En 3 días
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              startTransition(async () => {
                await snoozeChore(chore.id, 7);
                setIsSnoozeOpen(false);
              })
            }
          >
            Próxima semana
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setIsSnoozeOpen(false);
              onEdit();
            }}
          >
            Reprogramar
          </Button>
        </div>
      </Modal>

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
