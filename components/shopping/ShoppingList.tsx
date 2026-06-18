"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { Plus, ShoppingCart, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShoppingItemCard } from "@/components/shopping/ShoppingItemCard";
import { ShoppingItemForm } from "@/components/shopping/ShoppingItemForm";
import { addShoppingItem, updateShoppingItem } from "@/app/(app)/compra/actions";
import { createClient } from "@/lib/supabase/client";
import type { Category, ShoppingItem } from "@/lib/types";

interface ShoppingListProps {
  items: ShoppingItem[];
  categories: Category[];
  householdId: string;
  shoppingListId?: string;
}

export function ShoppingList({ items, categories, householdId, shoppingListId }: ShoppingListProps) {
  const { showToast } = useToast();
  const [localItems, setLocalItems] = useState<ShoppingItem[]>(items);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`shopping_items:${householdId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shopping_items", filter: `household_id=eq.${householdId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newItem = payload.new as ShoppingItem;
            if (shoppingListId && newItem.shopping_list_id !== shoppingListId) return;
            setLocalItems((prev) => [newItem, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setLocalItems((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as ShoppingItem) : item)),
            );
          } else if (payload.eventType === "DELETE") {
            setLocalItems((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId, shoppingListId]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const stores = useMemo(
    () =>
      Array.from(new Set(localItems.map((item) => item.store).filter((store): store is string => !!store))),
    [localItems],
  );

  const matchesFilters = (item: ShoppingItem) => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && item.category_id !== categoryFilter) return false;
    if (storeFilter && item.store !== storeFilter) return false;
    return true;
  };

  const activeItems = localItems.filter((item) => !item.is_completed && matchesFilters(item));
  const completedItems = localItems.filter((item) => item.is_completed && matchesFilters(item));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Input
          label="Buscar"
          name="search"
          placeholder="Buscar producto..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="flex-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Categoría"
          name="categoryFilter"
          placeholder="Todas"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          options={categories.map((category) => ({ value: category.id, label: category.name }))}
        />
        <Select
          label="Tienda"
          name="storeFilter"
          placeholder="Todas"
          value={storeFilter}
          onChange={(event) => setStoreFilter(event.target.value)}
          options={stores.map((store) => ({ value: store, label: store }))}
        />
      </div>

      {activeItems.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Todavía no hay productos en la lista."
          description="Añade el primero para empezar."
        />
      ) : (
        <ul className="stagger-list flex flex-col gap-3">
          {activeItems.map((item) => (
            <li key={`${item.id}-${item.is_completed}`}>
              <ShoppingItemCard
                item={item}
                category={item.category_id ? categoryById.get(item.category_id) : undefined}
                onEdit={() => setEditingItem(item)}
              />
            </li>
          ))}
        </ul>
      )}

      {completedItems.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowCompleted((value) => !value)}
            className="flex items-center gap-1 text-sm font-medium text-muted"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showCompleted ? "rotate-180" : ""}`}
              aria-hidden
            />
            Comprados ({completedItems.length})
          </button>
          {showCompleted && (
            <ul className="mt-3 flex flex-col gap-3">
              {completedItems.map((item) => (
                <li key={`${item.id}-${item.is_completed}`}>
                  <ShoppingItemCard
                    item={item}
                    category={item.category_id ? categoryById.get(item.category_id) : undefined}
                    onEdit={() => setEditingItem(item)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsAddOpen(true)}
        aria-label="Añadir producto"
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-terracotta text-white shadow-lg hover:bg-coral active:scale-95 transition-transform"
      >
        <Plus className="h-6 w-6" aria-hidden />
      </button>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Añadir producto">
        <ShoppingItemForm
          action={addShoppingItem}
          categories={categories}
          shoppingListId={shoppingListId}
          onSuccess={() => { setIsAddOpen(false); showToast("Producto añadido"); }}
          onError={() => showToast("No se ha podido guardar. Inténtalo de nuevo.")}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar producto"
      >
        {editingItem && (
          <ShoppingItemForm
            action={updateShoppingItem.bind(null, editingItem.id)}
            categories={categories}
            item={editingItem}
            onSuccess={() => { setEditingItem(null); showToast("Producto actualizado"); }}
            onError={() => showToast("No se ha podido guardar. Inténtalo de nuevo.")}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </Modal>
    </div>
  );
}
