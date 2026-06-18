"use client";

import { useState, useTransition } from "react";
import { Plus, Heart, ExternalLink, Pencil, Trash2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/format";
import { WishlistItemForm } from "@/components/wishlist/WishlistItemForm";
import { createWishlistItem, updateWishlistItem, deleteWishlistItem, voteWishlistItem } from "@/app/(app)/deseos/actions";
import { cn } from "@/lib/utils";
import type { WishlistItem } from "@/lib/types";

interface Member {
  user_id: string;
  display_name: string | null;
}

interface WishlistListProps {
  items: WishlistItem[];
  members: Member[];
  currentUserId: string;
}

const STATUS_FILTER_OPTIONS = [
  { value: "idea", label: "Pendiente" },
  { value: "aprobado", label: "Aprobado" },
  { value: "comprado", label: "Comprado" },
  { value: "descartado", label: "Rechazado" },
];

const STATUS_BADGE: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  idea: "neutral",
  aprobado: "success",
  comprado: "warning",
  descartado: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  idea: "Pendiente",
  aprobado: "Aprobado",
  comprado: "Comprado",
  descartado: "Rechazado",
};

export function WishlistList({ items, members, currentUserId }: WishlistListProps) {
  const { showToast } = useToast();
  const [, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<WishlistItem | null>(null);

  const filtered = statusFilter ? items.filter((item) => item.status === statusFilter) : items;

  const otherMembers = members.filter((m) => m.user_id !== currentUserId);

  function handleVote(itemId: string, vote: "quiero" | "no_ahora") {
    startTransition(async () => {
      await voteWishlistItem(itemId, vote);
    });
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-24 pt-4">
      <h1 className="text-xl font-semibold text-brown">Lista de deseos</h1>

      <Select
        label="Estado"
        name="statusFilter"
        placeholder="Todos"
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
        options={STATUS_FILTER_OPTIONS}
      />

      {filtered.length === 0 ? (
        items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="La lista de deseos está vacía."
            description="Apuntad lo que queréis comprar, asignadle una prioridad y votad juntos."
            action={
              <Button type="button" onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4" aria-hidden />
                Añadir deseo
              </Button>
            }
          />
        ) : (
          <EmptyState icon={Heart} title="Sin resultados." description="No hay deseos con el estado seleccionado." />
        )
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((item) => {
            const myVote = item.votes?.[currentUserId] ?? null;

            return (
              <li key={item.id}>
                <Card className="flex flex-col gap-3">
                  {/* Header row */}
                  <div className="flex items-start gap-3">
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
                    <Badge variant={STATUS_BADGE[item.status]}>{STATUS_LABEL[item.status] ?? item.status}</Badge>
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
                  </div>

                  {/* Vote row — only shown for items not yet purchased */}
                  {item.status !== "comprado" && (
                    <div className="flex items-center justify-between border-t border-border pt-2">
                      {/* Other member vote summary */}
                      <div className="flex flex-col gap-0.5">
                        {otherMembers.map((m) => {
                          const theirVote = item.votes?.[m.user_id] ?? null;
                          return (
                            <p key={m.user_id} className="text-xs text-muted">
                              {m.display_name ?? "Miembro"}:{" "}
                              <span className={cn(theirVote === "quiero" ? "text-sage font-medium" : theirVote === "no_ahora" ? "text-danger font-medium" : "")}>
                                {theirVote === "quiero" ? "Quiero" : theirVote === "no_ahora" ? "No ahora" : "Sin votar"}
                              </span>
                            </p>
                          );
                        })}
                      </div>

                      {/* Vote buttons */}
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          aria-label="Quiero"
                          aria-pressed={myVote === "quiero"}
                          onClick={() => handleVote(item.id, "quiero")}
                          className={cn(
                            "flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition active:scale-[0.95]",
                            myVote === "quiero"
                              ? "border-sage/30 bg-sage/10 text-sage"
                              : "border-border bg-card text-muted hover:bg-sand",
                          )}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
                          Quiero
                        </button>
                        <button
                          type="button"
                          aria-label="No ahora"
                          aria-pressed={myVote === "no_ahora"}
                          onClick={() => handleVote(item.id, "no_ahora")}
                          className={cn(
                            "flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition active:scale-[0.95]",
                            myVote === "no_ahora"
                              ? "border-danger/30 bg-danger/10 text-danger"
                              : "border-border bg-card text-muted hover:bg-sand",
                          )}
                        >
                          <ThumbsDown className="h-3.5 w-3.5" aria-hidden />
                          No ahora
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Button type="button" onClick={() => setIsAddOpen(true)} className="mt-4 w-full">
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
