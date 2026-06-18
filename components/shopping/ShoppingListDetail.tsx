"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Trash, ShoppingCart } from "@phosphor-icons/react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  addShoppingTrip,
  deleteShoppingTrip,
  markShoppingListPurchased,
  archiveShoppingList,
  deleteShoppingList,
  type ShoppingListFormState,
} from "@/app/(app)/compra/listas/actions";
import type { ShoppingList, ShoppingTrip } from "@/lib/types";

interface ShoppingListDetailProps {
  list: ShoppingList;
  trips: ShoppingTrip[];
  itemsCount: number;
}

const initialState: ShoppingListFormState = {};

const STATUS_LABEL: Record<string, string> = {
  borrador: "Borrador",
  activa: "Activa",
  comprada: "Comprada",
  archivada: "Archivada",
};

function AddTripForm({ listId, onSuccess, onCancel }: { listId: string; onSuccess: () => void; onCancel: () => void }) {
  const boundAction = addShoppingTrip.bind(null, listId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Input label="Tienda" name="store" placeholder="Mercadona" />
      <Input
        label="Importe (€)"
        name="totalAmount"
        type="number"
        step="0.01"
        required
        error={state.fieldErrors?.totalAmount}
      />
      <Input label="Fecha" name="shoppingDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="mt-2 flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" isLoading={isPending}>
          Guardar
        </Button>
      </div>
    </form>
  );
}

function MarkPurchasedForm({
  listId,
  suggestedTotal,
  onSuccess,
  onCancel,
}: {
  listId: string;
  suggestedTotal: number;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const boundAction = markShoppingListPurchased.bind(null, listId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Input
        label="Total gastado (€)"
        name="actualTotal"
        type="number"
        step="0.01"
        defaultValue={suggestedTotal > 0 ? suggestedTotal : undefined}
        error={state.fieldErrors?.actualTotal}
      />
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="mt-2 flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" isLoading={isPending}>
          Marcar compra como hecha
        </Button>
      </div>
    </form>
  );
}

export function ShoppingListDetail({ list, trips, itemsCount }: ShoppingListDetailProps) {
  const [isPending, startTransition] = useTransition();
  const [isAddTripOpen, setIsAddTripOpen] = useState(false);
  const [isMarkOpen, setIsMarkOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const tripsTotal = trips.reduce((sum, trip) => sum + Number(trip.total_amount), 0);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/compra/listas" className="text-sm font-medium text-terracotta">
        ← Volver al historial
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{list.name}</CardTitle>
          <Badge variant={list.status === "comprada" ? "success" : "neutral"}>{STATUS_LABEL[list.status]}</Badge>
        </div>
        <CardDescription>
          {list.planned_budget != null && `Presupuesto previsto: ${formatCurrency(list.planned_budget)}`}
        </CardDescription>
        {list.actual_total != null && (
          <p className="mt-2 text-sm text-brown">
            Total gastado: <span className="font-medium">{formatCurrency(list.actual_total)}</span>
            {list.planned_budget != null && (
              <span className="text-muted"> (presupuesto {formatCurrency(list.planned_budget)})</span>
            )}
          </p>
        )}
      </Card>

      <Link href={`/compra?lista=${list.id}`}>
        <Card className="flex items-center gap-3 transition hover:bg-sand active:scale-[0.98]">
          <ShoppingCart className="h-5 w-5 text-terracotta" aria-hidden />
          <p className="text-sm font-medium text-brown">Ver productos de esta lista ({itemsCount})</p>
        </Card>
      </Link>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-brown">Por tienda</h2>
        {trips.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay compras registradas.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {trips.map((trip) => (
              <li
                key={trip.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm text-brown"
              >
                <span>
                  {trip.store ?? "Tienda"} {trip.shopping_date ? `· ${formatDate(trip.shopping_date)}` : ""}
                </span>
                <span className="flex items-center gap-2">
                  {formatCurrency(trip.total_amount)}
                  <button
                    type="button"
                    aria-label="Eliminar compra"
                    onClick={() => startTransition(() => deleteShoppingTrip(list.id, trip.id))}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:text-danger active:bg-sand"
                  >
                    <Trash className="h-4 w-4" aria-hidden />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
        <Button type="button" variant="secondary" className="mt-3" onClick={() => setIsAddTripOpen(true)}>
          Añadir compra por tienda
        </Button>
      </div>

      {list.status !== "comprada" && (
        <Button type="button" onClick={() => setIsMarkOpen(true)}>
          Marcar compra como hecha
        </Button>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          isLoading={isPending}
          onClick={() => startTransition(() => archiveShoppingList(list.id))}
        >
          Archivar lista
        </Button>
        <Button type="button" variant="danger" className="flex-1" onClick={() => setIsConfirmingDelete(true)}>
          Eliminar
        </Button>
      </div>

      <Modal isOpen={isAddTripOpen} onClose={() => setIsAddTripOpen(false)} title="Añadir compra por tienda">
        <AddTripForm listId={list.id} onSuccess={() => setIsAddTripOpen(false)} onCancel={() => setIsAddTripOpen(false)} />
      </Modal>

      <Modal isOpen={isMarkOpen} onClose={() => setIsMarkOpen(false)} title="Marcar compra como hecha">
        <MarkPurchasedForm
          listId={list.id}
          suggestedTotal={tripsTotal}
          onSuccess={() => setIsMarkOpen(false)}
          onCancel={() => setIsMarkOpen(false)}
        />
      </Modal>

      <Modal isOpen={isConfirmingDelete} onClose={() => setIsConfirmingDelete(false)} title="Eliminar lista">
        <p className="text-sm text-brown">¿Seguro que quieres eliminarlo?</p>
        <div className="mt-4 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsConfirmingDelete(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            isLoading={isPending}
            onClick={() => startTransition(() => deleteShoppingList(list.id))}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
