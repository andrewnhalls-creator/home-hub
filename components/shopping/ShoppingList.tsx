"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { Plus, ShoppingCart, CaretDown, X, ArrowsDownUp, CheckCircle } from "@phosphor-icons/react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShoppingItemCard } from "@/components/shopping/ShoppingItemCard";
import { ShoppingItemForm } from "@/components/shopping/ShoppingItemForm";
import { FinishShoppingSheet } from "@/components/shopping/FinishShoppingSheet";
import { addShoppingItem, updateShoppingItem } from "@/app/(app)/compra/actions";
import { createClient } from "@/lib/supabase/client";
import type { Category, HouseholdMember, ShoppingItem } from "@/lib/types";

interface ShoppingListProps {
  items: ShoppingItem[];
  categories: Category[];
  members: Pick<HouseholdMember, "user_id" | "display_name">[];
  householdId: string;
  shoppingListId?: string;
}

export function ShoppingList({ items, categories, members, householdId, shoppingListId }: ShoppingListProps) {
  const { showToast } = useToast();
  const [localItems, setLocalItems] = useState<ShoppingItem[]>(items);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [sortMode, setSortMode] = useState<"fecha" | "categoria">("categoria");
  const [isFinishOpen, setIsFinishOpen] = useState(false);

  // Read the stored sort preference after mount (SSR always renders "categoria",
  // so reading localStorage in the initializer would cause a hydration mismatch).
  useEffect(() => {
    const stored = localStorage.getItem("shopping-sort") as "fecha" | "categoria" | null;
    if (stored === "fecha") setSortMode("fecha");
  }, []);
  const [quickName, setQuickName] = useState("");
  const [quickState, quickAction, quickPending] = useActionState(addShoppingItem, {});

  // Reset input on success using derived-state pattern (avoids setState-in-effect lint).
  const [prevQuickState, setPrevQuickState] = useState(quickState);
  if (prevQuickState !== quickState) {
    setPrevQuickState(quickState);
    if (quickState.success) setQuickName("");
  }

  // Keep localItems in sync when server data changes (router.refresh or navigation).
  // The realtime handler below still provides immediate in-place updates.
  const [prevItems, setPrevItems] = useState(items);
  if (prevItems !== items) {
    setPrevItems(items);
    setLocalItems(items);
  }

  // Surface feedback toasts — showToast is an external context call, not local setState.
  useEffect(() => {
    if (quickState.success) showToast("Producto añadido");
    else if (quickState.error) showToast("No se ha podido guardar. Inténtalo de nuevo.", "error");
  }, [quickState, showToast]);

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

  const memberById = useMemo(
    () => new Map(members.map((m) => [m.user_id, m.display_name ?? m.user_id])),
    [members],
  );

  const matchesFilters = (item: ShoppingItem) => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && item.category_id !== categoryFilter) return false;
    if (storeFilter && item.store !== storeFilter) return false;
    return true;
  };

  const sortByCategory = (arr: ShoppingItem[]) =>
    [...arr].sort((a, b) => {
      const catA = a.category_id ? (categoryById.get(a.category_id)?.name ?? "￿") : "￿";
      const catB = b.category_id ? (categoryById.get(b.category_id)?.name ?? "￿") : "￿";
      return catA.localeCompare(catB, "es");
    });

  const filtered = localItems.filter((item) => !item.is_completed && matchesFilters(item));
  const activeItems = sortMode === "categoria" ? sortByCategory(filtered) : filtered;
  const completedItems = localItems.filter((item) => item.is_completed && matchesFilters(item));

  // Grouped view (mockup): items clustered under category-header cards.
  const GROUP_ACCENTS = ["text-sage", "text-amber", "text-olive", "text-rose"];
  const groupedItems = useMemo(() => {
    if (sortMode !== "categoria") return null;
    const groups = new Map<string, ShoppingItem[]>();
    for (const item of activeItems) {
      const name = item.category_id ? (categoryById.get(item.category_id)?.name ?? "Otros") : "Otros";
      const list = groups.get(name) ?? [];
      list.push(item);
      groups.set(name, list);
    }
    // "Otros" always goes last.
    return Array.from(groups.entries()).sort(([a], [b]) => {
      if (a === "Otros") return 1;
      if (b === "Otros") return -1;
      return a.localeCompare(b, "es");
    });
  }, [sortMode, activeItems, categoryById]);

  return (
    <div className="flex flex-col gap-4">
      {/* Quick-add bar */}
      <form action={quickAction} className="flex items-center gap-2">
        {shoppingListId && <input type="hidden" name="shoppingListId" value={shoppingListId} />}
        <input
          name="name"
          value={quickName}
          onChange={(e) => setQuickName(e.target.value)}
          placeholder="Añadir producto..."
          autoComplete="off"
          className="h-11 flex-1 rounded-xl border border-border bg-card px-4 text-sm text-brown placeholder:text-muted outline-none focus:ring-2 focus:ring-terracotta"
        />
        <button
          type="submit"
          disabled={quickPending}
          aria-label="Añadir"
          onClick={(e) => {
            if (!quickName.trim()) {
              e.preventDefault();
              setIsAddOpen(true);
            }
          }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terracotta text-cream transition-transform active:scale-95 disabled:opacity-40"
        >
          <Plus className="h-5 w-5" aria-hidden />
        </button>
      </form>

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

      {(categoryFilter || storeFilter) && (
        <div className="flex flex-wrap gap-2">
          {categoryFilter && (
            <button
              type="button"
              onClick={() => setCategoryFilter("")}
              className="inline-flex items-center gap-1.5 rounded-full bg-terracotta/10 px-3 py-1 text-xs font-medium text-terracotta"
            >
              Categoría: {categoryById.get(categoryFilter)?.name ?? categoryFilter}
              <X className="h-3 w-3" aria-hidden />
            </button>
          )}
          {storeFilter && (
            <button
              type="button"
              onClick={() => setStoreFilter("")}
              className="inline-flex items-center gap-1.5 rounded-full bg-terracotta/10 px-3 py-1 text-xs font-medium text-terracotta"
            >
              Tienda: {storeFilter}
              <X className="h-3 w-3" aria-hidden />
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => {
            const next = sortMode === "fecha" ? "categoria" : "fecha";
            setSortMode(next);
            localStorage.setItem("shopping-sort", next);
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-brown"
        >
          <ArrowsDownUp className="h-3.5 w-3.5" aria-hidden />
          {sortMode === "fecha" ? "Por fecha" : "Por categoría"}
        </button>
      </div>

      {activeItems.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="La lista está vacía."
          description="Añade lo que necesitéis y marcadlo al llegar al super."
        />
      ) : groupedItems ? (
        <div className="flex flex-col gap-4">
          {groupedItems.map(([groupName, groupItems], index) => (
            <section
              key={groupName}
              aria-label={groupName}
              className="rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-[var(--shadow-card)]"
            >
              <h3 className={`text-sm font-bold ${GROUP_ACCENTS[index % GROUP_ACCENTS.length]}`}>
                {groupName}
              </h3>
              <ul className="mt-1 flex flex-col divide-y divide-border/60">
                {groupItems.map((item) => (
                  <li key={`${item.id}-${item.is_completed}`}>
                    <ShoppingItemCard
                      flat
                      item={item}
                      category={item.category_id ? categoryById.get(item.category_id) : undefined}
                      membersById={memberById}
                      onEdit={() => setEditingItem(item)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="stagger-list flex flex-col gap-3">
          {activeItems.map((item) => (
            <li key={`${item.id}-${item.is_completed}`}>
              <ShoppingItemCard
                item={item}
                category={item.category_id ? categoryById.get(item.category_id) : undefined}
                membersById={memberById}
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
            aria-expanded={showCompleted}
            className="flex items-center gap-1 text-sm font-medium text-muted"
          >
            <CaretDown
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
                    membersById={memberById}
                    onEdit={() => setEditingItem(item)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Finalizar compra — standing list only (named lists have their own purchase flow) */}
      {!shoppingListId && completedItems.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setIsFinishOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isFinishOpen}
            className="fixed left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-terracotta px-5 py-3 text-sm font-semibold text-cream shadow-[var(--shadow-lg)] transition hover:bg-coral active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
          >
            <CheckCircle weight="fill" size={18} aria-hidden />
            Finalizar compra
          </button>
          <FinishShoppingSheet
            isOpen={isFinishOpen}
            onClose={() => setIsFinishOpen(false)}
            boughtCount={completedItems.length}
            pendingCount={activeItems.length}
          />
        </>
      )}

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
