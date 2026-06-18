"use client";

import { useMemo, useState } from "react";
import { Plus, ListChecks } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChoreCard } from "@/components/chores/ChoreCard";
import { ChoreForm } from "@/components/chores/ChoreForm";
import { useToast } from "@/components/ui/Toast";
import { createChore, updateChore } from "@/app/(app)/tareas/actions";
import type { Chore } from "@/lib/types";

interface Member {
  user_id: string;
  display_name: string | null;
}

interface ChoreListProps {
  chores: Chore[];
  members: Member[];
}

const STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "hecho", label: "Hecho" },
];

export function ChoreList({ chores, members }: ChoreListProps) {
  const { showToast } = useToast();
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);

  const memberByUserId = useMemo(() => new Map(members.map((m) => [m.user_id, m.display_name])), [members]);

  const filtered = chores.filter((chore) => {
    if (assigneeFilter && chore.assigned_to !== assigneeFilter) return false;
    if (statusFilter && chore.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Asignado a"
          name="assigneeFilter"
          placeholder="Todos"
          value={assigneeFilter}
          onChange={(event) => setAssigneeFilter(event.target.value)}
          options={members.map((member) => ({
            value: member.user_id,
            label: member.display_name ?? "Miembro",
          }))}
        />
        <Select
          label="Estado"
          name="statusFilter"
          placeholder="Todos"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          options={STATUS_OPTIONS}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ListChecks} title="Tu semana está lista." description="Añade una tarea para empezar." />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((chore) => (
            <li key={chore.id}>
              <ChoreCard
                chore={chore}
                assignedName={chore.assigned_to ? memberByUserId.get(chore.assigned_to) ?? undefined : undefined}
                onEdit={() => setEditingChore(chore)}
              />
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        onClick={() => setIsAddOpen(true)}
        className="mt-4 w-full"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Añadir tarea
      </Button>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Añadir tarea">
        <ChoreForm
          action={createChore}
          members={members}
          onSuccess={() => { setIsAddOpen(false); showToast("Tarea añadida"); }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      <Modal isOpen={!!editingChore} onClose={() => setEditingChore(null)} title="Editar tarea">
        {editingChore && (
          <ChoreForm
            action={updateChore.bind(null, editingChore.id)}
            members={members}
            chore={editingChore}
            onSuccess={() => { setEditingChore(null); showToast("Tarea actualizada"); }}
            onCancel={() => setEditingChore(null)}
          />
        )}
      </Modal>
    </div>
  );
}
