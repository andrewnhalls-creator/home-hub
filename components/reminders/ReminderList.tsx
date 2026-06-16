"use client";

import { useMemo, useState } from "react";
import { isToday, isWithinInterval, addDays } from "date-fns";
import { Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
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

type Filter = "hoy" | "semana" | "todos" | "completados";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Semana" },
  { value: "todos", label: "Todos" },
  { value: "completados", label: "Completados" },
];

export function ReminderList({ reminders, categories, members }: ReminderListProps) {
  const [filter, setFilter] = useState<Filter>("todos");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const memberByUserId = useMemo(() => new Map(members.map((m) => [m.user_id, m.display_name])), [members]);

  const filtered = reminders.filter((reminder) => {
    if (filter === "completados") return reminder.status === "hecho";
    if (reminder.status === "hecho") return false;
    if (filter === "todos") return true;
    if (!reminder.due_at) return false;
    const due = new Date(reminder.due_at);
    if (filter === "hoy") return isToday(due);
    if (filter === "semana") return isWithinInterval(due, { start: new Date(), end: addDays(new Date(), 7) });
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium",
              filter === item.value ? "bg-terracotta text-cream" : "bg-card text-muted",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Bell} title="Nada pendiente por ahora." description="Añade un recordatorio para empezar." />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((reminder) => (
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

      <Button
        type="button"
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-20 right-4 z-30 rounded-full px-5 shadow-md md:bottom-6"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Añadir recordatorio
      </Button>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Añadir recordatorio">
        <ReminderForm
          action={createReminder}
          categories={categories}
          members={members}
          onSuccess={() => setIsAddOpen(false)}
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
            onSuccess={() => setEditingReminder(null)}
            onCancel={() => setEditingReminder(null)}
          />
        )}
      </Modal>
    </div>
  );
}
