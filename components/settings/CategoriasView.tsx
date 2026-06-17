"use client";

import { useState, useActionState, useEffect } from "react";
import { Plus, Pencil, Archive, ArchiveRestore, X, Check, type LucideIcon } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  createCategory,
  updateCategory,
  archiveCategory,
  restoreCategory,
} from "@/app/(app)/ajustes/categorias/actions";
import type { CategoriaActionState } from "@/app/(app)/ajustes/categorias/actions";

interface Category {
  id: string;
  module: string;
  name: string;
  color: string | null;
  is_default: boolean;
  archived_at: string | null;
}

interface CategoriasViewProps {
  categories: Category[];
}

const MODULE_LABELS: Record<string, string> = {
  shopping: "Compra",
  finance: "Finanzas",
  reminders: "Recordatorios",
  chores: "Tareas",
  documents: "Documentos",
  wishlist: "Deseos",
  meals: "Menú",
};

const MODULES = Object.keys(MODULE_LABELS) as Array<keyof typeof MODULE_LABELS>;

const PRESET_COLORS = [
  "#E07A5F", // terracotta
  "#81B29A", // sage
  "#F2CC8F", // amber
  "#C9A0DC", // rose
  "#6B9AC4", // blue
  "#D4A5A5", // pink
  "#A8C5A0", // green
  "#C4956A", // brown
];

const initialState: CategoriaActionState = {};

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`Color ${c}`}
          onClick={() => onChange(c)}
          className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
          style={{
            backgroundColor: c,
            borderColor: value === c ? "#4a3728" : "transparent",
          }}
        />
      ))}
    </div>
  );
}

function CategoryRow({ cat }: { cat: Category }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cat.name);
  const [color, setColor] = useState(cat.color ?? PRESET_COLORS[0]);

  const [updateState, updateAction, updatePending] = useActionState(updateCategory, initialState);
  const [archiveState, archiveAction, archivePending] = useActionState(archiveCategory, initialState);
  const [restoreState, restoreAction, restorePending] = useActionState(restoreCategory, initialState);

  if (editing) {
    return (
      <li className="flex flex-col gap-3 py-3 border-b border-sand last:border-0">
        <form action={updateAction} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={cat.id} />
          <input type="hidden" name="color" value={color} />
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full shrink-0"
              style={{ backgroundColor: color }}
              aria-hidden
            />
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Nombre de la categoría"
              className="flex-1 min-h-[44px] rounded-xl border border-border bg-card px-3 py-2 text-base text-brown placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>
          <ColorPicker value={color} onChange={setColor} />
          {(updateState?.error || updateState?.fieldErrors?.name) && (
            <p className="text-xs text-danger">
              {updateState.error ?? updateState.fieldErrors?.name}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={updatePending}>
              <Check className="h-3.5 w-3.5 mr-1" aria-hidden />
              Guardar
            </Button>
            <Button
              type="button"
              variant="ghost"
                           onClick={() => setEditing(false)}
            >
              <X className="h-3.5 w-3.5 mr-1" aria-hidden />
              Cancelar
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 py-3 border-b border-sand last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="h-4 w-4 rounded-full shrink-0"
          style={{ backgroundColor: cat.color ?? "#C4956A" }}
          aria-hidden
        />
        <span className={`text-sm truncate ${cat.archived_at ? "text-muted line-through" : "text-brown"}`}>
          {cat.name}
        </span>
        {cat.is_default && (
          <span className="text-xs text-muted shrink-0">(predeterminada)</span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {!cat.archived_at && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Editar ${cat.name}`}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted hover:text-brown hover:bg-sand"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}

        {!cat.archived_at ? (
          <form action={archiveAction}>
            <input type="hidden" name="id" value={cat.id} />
            <button
              type="submit"
              disabled={archivePending}
              aria-label={`Archivar ${cat.name}`}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted hover:text-amber hover:bg-amber/10 disabled:opacity-50"
            >
              <Archive className="h-3.5 w-3.5" aria-hidden />
            </button>
          </form>
        ) : (
          <form action={restoreAction}>
            <input type="hidden" name="id" value={cat.id} />
            <button
              type="submit"
              disabled={restorePending}
              aria-label={`Restaurar ${cat.name}`}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted hover:text-sage hover:bg-sage/10 disabled:opacity-50"
            >
              <ArchiveRestore className="h-3.5 w-3.5" aria-hidden />
            </button>
          </form>
        )}
        {(archiveState?.error || restoreState?.error) && (
          <span className="text-xs text-danger">Error</span>
        )}
      </div>
    </li>
  );
}

interface NewCategoryFieldsProps {
  module: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function NewCategoryFields({ module, onSuccess, onCancel }: NewCategoryFieldsProps) {
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [state, formAction, pending] = useActionState(createCategory, initialState);

  useEffect(() => {
    if (state?.success) onSuccess();
  }, [state?.success, onSuccess]);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-terracotta/30 bg-cream p-3"
      noValidate
    >
      <input type="hidden" name="module" value={module} />
      <input type="hidden" name="color" value={color} />
      <div className="flex items-center gap-2">
        <div
          className="h-4 w-4 rounded-full shrink-0"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <input
          name="name"
          placeholder="Nombre de la categoría"
          aria-label="Nombre de la categoría"
          aria-describedby={state?.fieldErrors?.name ? "cat-name-error" : undefined}
          aria-invalid={!!state?.fieldErrors?.name}
          className="flex-1 min-h-[44px] rounded-xl border border-border bg-card px-3 py-2 text-base text-brown placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-terracotta"
          autoFocus
        />
      </div>
      {state?.fieldErrors?.name && (
        <p id="cat-name-error" className="text-xs text-danger">
          {state.fieldErrors.name}
        </p>
      )}
      <ColorPicker value={color} onChange={setColor} />
      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          Crear
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function NewCategoryForm({ module }: { module: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-[44px] w-full items-center gap-2 rounded-xl border border-dashed border-sand px-3 text-sm text-muted hover:border-terracotta hover:text-terracotta transition-colors"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Añadir categoría
      </button>
    );
  }

  return (
    <NewCategoryFields
      module={module}
      onSuccess={() => setOpen(false)}
      onCancel={() => setOpen(false)}
    />
  );
}

function ModuleSection({ module, categories }: { module: string; categories: Category[] }) {
  const active = categories.filter((c) => !c.archived_at);
  const archived = categories.filter((c) => c.archived_at);
  const [showArchived, setShowArchived] = useState(false);

  return (
    <Card>
      <CardTitle>{MODULE_LABELS[module] ?? module}</CardTitle>

      {active.length === 0 && archived.length === 0 ? (
        <div className="mt-2">
          <EmptyState
            icon={Archive as LucideIcon}
            title="Sin categorías"
            description="Añade una categoría para este módulo."
          />
        </div>
      ) : null}

      {active.length > 0 && (
        <ul className="mt-2">
          {active.map((cat) => (
            <CategoryRow key={cat.id} cat={cat} />
          ))}
        </ul>
      )}

      {archived.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="text-xs text-muted underline underline-offset-2"
          >
            {showArchived
              ? "Ocultar archivadas"
              : `Mostrar ${archived.length} archivada${archived.length === 1 ? "" : "s"}`}
          </button>
          {showArchived && (
            <ul className="mt-2">
              {archived.map((cat) => (
                <CategoryRow key={cat.id} cat={cat} />
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-3">
        <NewCategoryForm module={module} />
      </div>
    </Card>
  );
}

export function CategoriasView({ categories }: CategoriasViewProps) {
  return (
    <div className="flex flex-col gap-4">
      {MODULES.map((module) => (
        <ModuleSection
          key={module}
          module={module}
          categories={categories.filter((c) => c.module === module)}
        />
      ))}
    </div>
  );
}
