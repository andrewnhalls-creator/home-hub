"use client";

import { useState, useTransition } from "react";
import { isPast } from "date-fns";
import { Check, PencilSimple, Clock } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import type { Reminder } from "@/lib/types";
import { toggleReminderStatus, snoozeReminder } from "@/app/(app)/recordatorios/actions";

interface ReminderCardProps {
  reminder: Reminder;
  assignedName?: string;
  onEdit: () => void;
}

export function ReminderCard({ reminder, assignedName, onEdit }: ReminderCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isSnoozeOpen, setIsSnoozeOpen] = useState(false);

  const isDone = reminder.status === "hecho";
  const isOverdue = !isDone && reminder.due_at && isPast(new Date(reminder.due_at));

  return (
    <>
      <Card className="flex items-start gap-3">
        <button
          type="button"
          aria-label={isDone ? "Marcar como pendiente" : "Marcar como hecho"}
          disabled={isPending}
          onClick={() => startTransition(() => toggleReminderStatus(reminder.id, !isDone))}
          className="flex h-11 w-11 shrink-0 items-center justify-center disabled:opacity-50"
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
            {reminder.title}
          </p>
          {(reminder.due_at || reminder.description) && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
              {reminder.due_at && (
                <>
                  <Clock size={12} aria-hidden />
                  {formatDateTime(reminder.due_at)}
                </>
              )}
              {reminder.due_at && reminder.description && <span aria-hidden>·</span>}
              {reminder.description}
            </p>
          )}
          {assignedName && (
            <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-olive/10 py-0.5 pl-1 pr-2.5 text-xs font-medium text-olive">
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full bg-olive text-[9px] font-bold text-cream"
                aria-hidden
              >
                {assignedName.charAt(0).toUpperCase()}
              </span>
              {assignedName}
            </span>
          )}
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
            aria-label="Editar recordatorio"
            onClick={onEdit}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:bg-sand active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
          >
            <PencilSimple className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </Card>

      <Modal isOpen={isSnoozeOpen} onClose={() => setIsSnoozeOpen(false)} title="Posponer">
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              startTransition(async () => {
                await snoozeReminder(reminder.id, 10);
                setIsSnoozeOpen(false);
              })
            }
          >
            Posponer 10 minutos
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              startTransition(async () => {
                await snoozeReminder(reminder.id, 60);
                setIsSnoozeOpen(false);
              })
            }
          >
            Posponer 1 hora
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              startTransition(async () => {
                await snoozeReminder(reminder.id, 60 * 24);
                setIsSnoozeOpen(false);
              })
            }
          >
            Mañana
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

    </>
  );
}
