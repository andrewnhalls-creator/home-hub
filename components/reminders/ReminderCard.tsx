"use client";

import { useState, useTransition } from "react";
import { isPast } from "date-fns";
import { Circle, CheckCircle2, Pencil, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
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
  const { showToast } = useToast();
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
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-terracotta active:bg-terracotta/10 disabled:opacity-50"
        >
          {isDone ? <CheckCircle2 className="h-6 w-6" aria-hidden /> : <Circle className="h-6 w-6" aria-hidden />}
        </button>

        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-medium text-brown", isDone && "text-muted line-through")}>
            {reminder.title}
          </p>
          <p className="text-xs text-muted">
            {[reminder.due_at ? formatDateTime(reminder.due_at) : null, assignedName]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {reminder.description && <p className="mt-1 text-xs text-muted">{reminder.description}</p>}
        </div>

        {!isDone && (
          <Badge variant={isOverdue ? "danger" : "neutral"}>{isOverdue ? "Vencido" : "Pendiente"}</Badge>
        )}

        <div className="flex shrink-0 gap-1">
          {!isDone && (
            <button
              type="button"
              aria-label="Posponer"
              onClick={() => setIsSnoozeOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-sand active:bg-sand"
            >
              <Clock className="h-4 w-4" aria-hidden />
            </button>
          )}
          <button
            type="button"
            aria-label="Editar recordatorio"
            onClick={onEdit}
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-sand active:bg-sand"
          >
            <Pencil className="h-4 w-4" aria-hidden />
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
