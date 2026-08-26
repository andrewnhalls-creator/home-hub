"use client";

import { useActionState, useState } from "react";
import { CaretDown, CaretRight, ArrowCounterClockwise } from "@phosphor-icons/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type TrashItem = {
  id: string;
  label: string;
  sublabel?: string;
  deletedAt: string;
};

type RestoreAction = (
  _prevState: { error?: string },
  formData: FormData,
) => Promise<{ error?: string }>;

function TrashRow({
  item,
  restoreAction,
}: {
  item: TrashItem;
  restoreAction: RestoreAction;
}) {
  const [state, formAction, pending] = useActionState(restoreAction, {});

  return (
    <li className="flex items-center gap-3 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-muted line-through">{item.label}</p>
        {item.sublabel && (
          <p className="truncate text-xs text-muted">{item.sublabel}</p>
        )}
        <p className="text-xs text-muted">
          Eliminado el {format(new Date(item.deletedAt), "d MMM, HH:mm", { locale: es })}
        </p>
        {state.error && (
          <p className="mt-0.5 text-xs text-danger">{state.error}</p>
        )}
      </div>
      <form action={formAction}>
        <input type="hidden" name="id" value={item.id} />
        <button
          type="submit"
          disabled={pending}
          aria-label={`Restaurar ${item.label}`}
          title="Restaurar"
          className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-terracotta text-cream transition hover:bg-coral active:scale-[0.92] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          <ArrowCounterClockwise size={18} aria-hidden />
        </button>
      </form>
    </li>
  );
}

type TrashSectionProps = {
  title: string;
  items: TrashItem[];
  restoreAction: RestoreAction;
  emptyMessage?: string;
};

export function TrashSection({
  title,
  items,
  restoreAction,
  emptyMessage = "No hay elementos eliminados",
}: TrashSectionProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mt-3 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-card shadow-[var(--shadow-card)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-[48px] w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-sand"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-brown">
          {title}
        </span>
        <span className="text-muted">
          {open ? <CaretDown size={14} /> : <CaretRight size={14} />}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-3">
          {items.length === 0 ? (
            <p className="py-3 text-sm text-muted">{emptyMessage}</p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <TrashRow
                  key={item.id}
                  item={item}
                  restoreAction={restoreAction}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
