"use client";

import { useState, useTransition } from "react";
import { Plus, Heart, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";
import { WishlistItemForm } from "@/components/wishlist/WishlistItemForm";
import { createWishlistItem, updateWishlistItem, deleteWishlistItem } from "@/app/(app)/deseos/actions";
import type { WishlistItem } from "@/lib/types";

interface WishlistListProps {
  items: WishlistItem[];
}

const STATUS_FILTER_OPTIONS = [
  { value: "idea", label: "Idea" },
  { value: "aprobado", label: "Aprobado" },
  { value: "comprado", label: "Comprado" },
  { value: "descartado", label: "Descartado" },
];

const STATUS_BADGE: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  idea: "neutral",
  aprobado: "warning",
  comprado: "success",
  descartado: "danger",
};

export function WishlistList({ items }: WishlistListProps) {
  const { showToast } = useToast();
  const [, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<WishlistItem | null>(null);

  const filtered = statusFilter ? items.filter((item) => item.status === statusFilter) : items;

  return (
    <div className="flex flex-col gap-4">
      <Select
        label="Estado"
        name="statusFilter"
        placeholder="Todos"
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
        options={STATUS_FILTER_OPTIONS}
      />

      {filtered.length === 0 ? (
        <EmptyState icon={Heart} title="Todavía no hay deseos." description="Añade el primero para empezar." />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((item) => (
            <li key={item.id}>
              <Card className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-brown">{item.name}</p>
                  <p className="text-xs text-muted">
                    {[
                      item.estimated_cost != null ? formatCurrency(item.estimated_cost) : null,
                      item.priority !== "normal" ? item.priority : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-terracotta"
                    >
                      <ExternalLink className="h-3 w-3" aria-hidden />
                      Ver enlace
                    </a>
                  )}
                </div>
                <Badge variant={STATUS_BADGE[item.status]}>{item.status}</Badge>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    aria-label="Editar deseo"
                    onClick={() => setEditingItem(item)}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:bg-sand active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label="Eliminar deseo"
                    onClick={() => setDeletingItem(item)}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:bg-sand active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </Card>
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
        Añadir deseo
      </Button>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Añadir deseo">
        <WishlistItemForm action={createWishlistItem} onSuccess={() => { setIsAddOpen(false); showToast("Deseo añadido"); }} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="Editar deseo">
        {editingItem && (
          <WishlistItemForm
            action={updateWishlistItem.bind(null, editingItem.id)}
            item={editingItem}
            onSuccess={() => { setEditingItem(null); showToast("Deseo actualizado"); }}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </Modal>

      <Modal isOpen={!!deletingItem} onClose={() => setDeletingItem(null)} title="Eliminar deseo">
        <p className="text-sm text-brown">¿Seguro que quieres eliminarlo?</p>
        <div className="mt-4 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setDeletingItem(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            onClick={() => startTransition(async () => {
              if (deletingItem) await deleteWishlistItem(deletingItem.id);
              setDeletingItem(null);
              showToast("Deseo eliminado");
            })}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
