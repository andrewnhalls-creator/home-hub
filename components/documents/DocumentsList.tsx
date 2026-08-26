"use client";

import { useMemo, useState, useTransition } from "react";
import { isPast, differenceInCalendarDays, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, FileText, PencilSimple, Archive, Trash, Warning, ArrowSquareOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/format";
import { PrintButton } from "@/components/ui/PrintButton";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { createDocument, updateDocument, archiveDocument, deleteDocument } from "@/app/(app)/documentos/actions";
import { cn } from "@/lib/utils";
import type { HouseholdDocument } from "@/lib/types";

interface DocumentsListProps {
  documents: HouseholdDocument[];
}

const TYPE_ACCENTS = ["text-amber", "text-sage", "text-olive", "text-rose"];

function expiryInfo(doc: HouseholdDocument): { label: string; tone: "danger" | "muted" } | null {
  if (doc.expiry_date) {
    const expiry = parseISO(doc.expiry_date);
    const days = differenceInCalendarDays(expiry, new Date());
    const dateLabel = format(expiry, "d MMM", { locale: es });
    if (isPast(expiry) && days < 0) return { label: `Caducado (${dateLabel})`, tone: "danger" };
    if (days === 0) return { label: `Vence hoy (${dateLabel})`, tone: "danger" };
    if (days <= 30) return { label: `Vence en ${days} ${days === 1 ? "día" : "días"} (${dateLabel})`, tone: "danger" };
    return { label: `Caduca el ${formatDate(doc.expiry_date)}`, tone: "muted" };
  }
  if (doc.renewal_date) {
    const raw = format(parseISO(doc.renewal_date), "MMM yyyy", { locale: es });
    return { label: `Renovación: ${raw}`, tone: "muted" };
  }
  return null;
}

export function DocumentsList({ documents }: DocumentsListProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<HouseholdDocument | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<HouseholdDocument | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");

  const documentTypes = useMemo(
    () =>
      Array.from(
        new Set(documents.map((d) => d.document_type).filter((t): t is string => !!t)),
      ).sort((a, b) => a.localeCompare(b, "es")),
    [documents],
  );
  const typeAccent = (type: string | null) => {
    if (!type) return "text-muted";
    const index = documentTypes.indexOf(type);
    return TYPE_ACCENTS[(index >= 0 ? index : 0) % TYPE_ACCENTS.length];
  };

  const filtered = typeFilter ? documents.filter((d) => d.document_type === typeFilter) : documents;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-brown">Documentos</h1>
        <p className="mt-1 text-sm text-muted">Facturas, seguros y garantías del hogar, en orden.</p>
      </div>

      <Button type="button" onClick={() => setIsAddOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden />
        Nuevo documento
      </Button>

      {documentTypes.length > 0 && (
        <div className="scrollbar-none flex gap-2 overflow-x-auto" role="tablist" aria-label="Filtrar por tipo">
          {["", ...documentTypes].map((type) => {
            const isActive = typeFilter === type;
            return (
              <button
                key={type || "todos"}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  "min-h-[38px] shrink-0 whitespace-nowrap rounded-full border px-4 text-sm font-medium capitalize transition active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
                  isActive
                    ? "border-transparent bg-terracotta text-cream"
                    : "border-border bg-card text-brown hover:bg-sand",
                )}
              >
                {type || "Todos"}
              </button>
            );
          })}
        </div>
      )}

      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Sin documentos todavía."
          description="Guarda aquí carnets, seguros, contratos y garantías. La app os avisará antes de que alguno caduque."
          action={
            <Button type="button" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              Añadir documento
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex justify-end">
            <PrintButton label="Exportar PDF" />
          </div>
          <ul className="flex flex-col gap-3">
          {filtered.map((doc) => {
            const info = expiryInfo(doc);
            return (
              <li key={doc.id}>
                <div className="rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      {doc.document_type && (
                        <p className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider", typeAccent(doc.document_type))}>
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                          {doc.document_type}
                        </p>
                      )}
                      <p className="mt-0.5 text-sm font-bold text-brown">{doc.title}</p>
                      {(doc.provider || doc.notes) && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                          {[doc.provider, doc.notes].filter(Boolean).join(" — ")}
                        </p>
                      )}
                      {info && (
                        <p
                          className={cn(
                            "mt-1.5 flex items-center gap-1 text-xs font-medium",
                            info.tone === "danger" ? "text-danger" : "text-muted",
                          )}
                        >
                          {info.tone === "danger" && <Warning weight="fill" size={12} aria-hidden />}
                          {info.label}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        aria-label="Editar documento"
                        title="Editar"
                        onClick={() => setEditingDoc(doc)}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-sand active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                      >
                        <PencilSimple className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        aria-label="Archivar documento"
                        title="Archivar (guarda el documento sin eliminarlo)"
                        disabled={isPending}
                        onClick={() => startTransition(async () => { await archiveDocument(doc.id); showToast("Documento archivado"); })}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-sand active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                      >
                        <Archive className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        aria-label="Eliminar documento"
                        title="Eliminar"
                        onClick={() => setDeletingDoc(doc)}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-sand active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                      >
                        <Trash className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                  {doc.storage_url && (
                    <a
                      href={doc.storage_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex min-h-[40px] w-fit items-center gap-1.5 rounded-full border border-border px-4 text-xs font-semibold text-brown transition hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                    >
                      <ArrowSquareOut size={13} aria-hidden />
                      Ver documento
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        </>
      )}

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nuevo documento">
        <DocumentForm action={createDocument} onSuccess={() => { setIsAddOpen(false); showToast("Documento añadido"); }} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      <Modal isOpen={!!editingDoc} onClose={() => setEditingDoc(null)} title="Editar documento">
        {editingDoc && (
          <DocumentForm
            action={updateDocument.bind(null, editingDoc.id)}
            document={editingDoc}
            onSuccess={() => { setEditingDoc(null); showToast("Documento actualizado"); }}
            onCancel={() => setEditingDoc(null)}
          />
        )}
      </Modal>

      <Modal isOpen={!!deletingDoc} onClose={() => setDeletingDoc(null)} title="Eliminar documento">
        <p className="text-sm text-brown">¿Seguro que quieres eliminarlo?</p>
        <div className="mt-4 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setDeletingDoc(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            isLoading={isPending}
            onClick={() =>
              startTransition(async () => {
                if (deletingDoc) await deleteDocument(deletingDoc.id);
                setDeletingDoc(null);
                showToast("Documento eliminado");
              })
            }
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
