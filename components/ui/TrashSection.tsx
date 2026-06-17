"use client";

import { useActionState, useState } from "react";
import { ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
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
    <li className="flex items-center gap-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-700 truncate">{item.label}</p>
        {item.sublabel && (
          <p className="text-xs text-stone-400 truncate">{item.sublabel}</p>
        )}
        <p className="text-xs text-stone-400">
          Eliminado{" "}
          {format(new Date(item.deletedAt), "d MMM yyyy", { locale: es })}
        </p>
        {state.error && (
          <p className="text-xs text-red-500 mt-0.5">{state.error}</p>
        )}
      </div>
      <form action={formAction}>
        <input type="hidden" name="id" value={item.id} />
        <button
          type="submit"
          disabled={pending}
          aria-label={`Restaurar ${item.label}`}
          className="flex items-center gap-1 text-xs text-terracotta hover:opacity-80 font-medium px-2 py-1 rounded-lg hover:bg-terracotta/10 transition-colors disabled:opacity-50"
        >
          <RotateCcw size={12} />
          Restaurar
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
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 border border-stone-200 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 hover:bg-stone-100 transition-colors text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-stone-500 uppercase tracking-wide">
          {title}
        </span>
        <span className="text-stone-400">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-3">
          {items.length === 0 ? (
            <p className="text-sm text-stone-400 py-3">{emptyMessage}</p>
          ) : (
            <ul className="divide-y divide-stone-100">
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
