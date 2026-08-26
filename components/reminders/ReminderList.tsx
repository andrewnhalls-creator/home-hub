"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { isToday, isPast, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Bell, CaretDown, CalendarDots, Circle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { ReminderCard } from "@/components/reminders/ReminderCard";
import { ReminderForm } from "@/components/reminders/ReminderForm";
import { createReminder, updateReminder } from "@/app/(app)/recordatorios/actions";
import type { Category, Reminder } from "@/lib/types";

interface Member {
  user_id: string;
  display_name: string | null;
}

interface ReminderListProps {
  reminders: Reminder[];
  categories: Category[];
  members: Member[];
}

function upcomingLabel(dueAt: string): string {
  const due = new Date(dueAt);
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const isTomorrow =
    due.getFullYear() === tomorrow.getFullYear() &&
    due.getMonth() === tomorrow.getMonth() &&
    due.getDate() === tomorrow.getDate();
  if (isTomorrow) return `Mañana, ${format(due, "HH:mm")}`;
  return format(due, "EEE d MMM", { locale: es });
}

export function ReminderList({ reminders, categories, members }: ReminderListProps) {
  const { showToast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const memberByUserId = useMemo(() => new Map(members.map((m) => [m.user_id, m.display_name])), [members]);

  const pending = reminders.filter((r) => r.status !== "hecho");
  const completed = reminders.filter((r) => r.status === "hecho");
  // Hoy: due today, overdue, or without a date. Próximos: due after today.
  const todayGroup = pending.filter(
    (r) => !r.due_at || isToday(new Date(r.due_at)) || isPast(new Date(r.due_at)),
  );
  const upcomingGroup = pending.filter(
    (r) => r.due_at && !isToday(new Date(r.due_at)) && !isPast(new Date(r.due_at)),
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Hoy */}
      <section aria-label="Hoy">
        <h2 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-brown">
          <span className="rounded-md bg-terracotta/10 px-2 py-0.5 text-terracotta">Hoy</span>
          {todayGroup.length > 0 && (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-[11px] font-bold text-cream"
              aria-label={`${todayGroup.length} pendientes hoy`}
            >
              {todayGroup.length}
            </span>
          )}
        </h2>
        {todayGroup.length === 0 ? (
          <EmptyState icon={Bell} title="Nada pendiente hoy." description="Respira: el día está en calma." />
        ) : (
          <ul className="flex flex-col gap-3">
            {todayGroup.map((reminder) => (
              <li key={reminder.id}>
                <ReminderCard
                  reminder={reminder}
                  assignedName={reminder.assigned_to ? memberByUserId.get(reminder.assigned_to) ?? undefined : undefined}
                  onEdit={() => setEditingReminder(reminder)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Próximos */}
      {upcomingGroup.length > 0 && (
        <section
          aria-label="Próximos"
          className="rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-[var(--shadow-card)]"
        >
          <h2 className="text-sm font-semibold text-brown">Próximos</h2>
          <ul className="mt-2 flex flex-col divide-y divide-border/60">
            {upcomingGroup.map((reminder) => (
              <li key={reminder.id}>
                <button
                  type="button"
                  onClick={() => setEditingReminder(reminder)}
                  className="flex min-h-[48px] w-full items-center gap-3 py-2 text-left transition hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                >
                  <Circle size={18} className="shrink-0 text-muted" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-brown">{reminder.title}</span>
                    {reminder.due_at && (
                      <span className="block text-xs text-muted">{upcomingLabel(reminder.due_at)}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Link
            href="/calendario"
            className="mt-3 flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-border text-sm font-medium text-brown transition hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
          >
            <CalendarDots size={16} aria-hidden />
            Ver calendario
          </Link>
        </section>
      )}

      {/* Completados */}
      {completed.length > 0 && (
        <section
          aria-label="Completados"
          className="rounded-[var(--radius-xl)] border border-sage/25 bg-sage/[0.06] p-4"
        >
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            aria-expanded={showCompleted}
            className="flex min-h-[44px] w-full items-center gap-1.5 text-sm font-semibold text-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
          >
            <CaretDown
              size={16}
              className={`transition-transform ${showCompleted ? "rotate-180" : ""}`}
              aria-hidden
            />
            Completados ({completed.length})
          </button>
          {showCompleted && (
            <ul className="mt-2 flex flex-col gap-3">
              {completed.map((reminder) => (
                <li key={reminder.id}>
                  <ReminderCard
                    reminder={reminder}
                    assignedName={reminder.assigned_to ? memberByUserId.get(reminder.assigned_to) ?? undefined : undefined}
                    onEdit={() => setEditingReminder(reminder)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <Button
        type="button"
        onClick={() => setIsAddOpen(true)}
        className="mt-4 w-full"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Añadir recordatorio
      </Button>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Añadir recordatorio">
        <ReminderForm
          action={createReminder}
          categories={categories}
          members={members}
          onSuccess={() => { setIsAddOpen(false); showToast("Recordatorio añadido"); }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      <Modal isOpen={!!editingReminder} onClose={() => setEditingReminder(null)} title="Editar recordatorio">
        {editingReminder && (
          <ReminderForm
            action={updateReminder.bind(null, editingReminder.id)}
            categories={categories}
            members={members}
            reminder={editingReminder}
            onSuccess={() => { setEditingReminder(null); showToast("Recordatorio actualizado"); }}
            onCancel={() => setEditingReminder(null)}
          />
        )}
      </Modal>
    </div>
  );
}
