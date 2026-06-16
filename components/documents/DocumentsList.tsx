"use client";

import { useState, useTransition } from "react";
import { isPast, isBefore, addDays } from "date-fns";
import { Plus, FileText, Pencil, Archive, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";
import { DocumentForm } from "@/components/documents/DocumentForm";
import { createDocument, updateDocument, archiveDocument, deleteDocument } from "@/app/(app)/documentos/actions";
import type { HouseholdDocument } from "@/lib/types";

interface DocumentsListProps {
  documents: HouseholdDocument[];
}

export function DocumentsList({ documents }: DocumentsListProps) {
  const [isPending, startTransition] = useTransition();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<HouseholdDocument | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<HouseholdDocument | null>(null);

  const soonThreshold = addDays(new Date(), 30);

  return (
    <div className="flex flex-col gap-3">
      {documents.length === 0 ? (
        <EmptyState icon={FileText} title="Todavía no hay documentos." description="Añade el primero para empezar." />
      ) : (
        <ul className="flex flex-col gap-3">
          {documents.map((doc) => {
            const expiry = doc.expiry_date ? new Date(doc.expiry_date) : null;
            const isExpired = expiry && isPast(expiry);
            const isExpiringSoon = expiry && !isExpired && isBefore(expiry, soonThreshold);
            return (
              <li key={doc.id}>
                <Card className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brown">{doc.title}</p>
                    <p className="text-xs text-muted">
                      {[doc.document_type, doc.provider, doc.expiry_date ? `Caduca ${formatDate(doc.expiry_date)}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  {isExpired && <Badge variant="danger">Caducado</Badge>}
                  {isExpiringSoon && <Badge variant="warning">Caduca pronto</Badge>}
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      aria-label="Editar documento"
                      onClick={() => setEditingDoc(doc)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-sand"
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label="Archivar documento"
                      disabled={isPending}
                      onClick={() => startTransition(() => archiveDocument(doc.id))}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-sand"
                    >
                      <Archive className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label="Eliminar documento"
                      onClick={() => setDeletingDoc(doc)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-sand"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Button
        type="button"
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-20 right-4 z-30 rounded-full px-5 shadow-md md:bottom-6"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Añadir documento
      </Button>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Añadir documento">
        <DocumentForm action={createDocument} onSuccess={() => setIsAddOpen(false)} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      <Modal isOpen={!!editingDoc} onClose={() => setEditingDoc(null)} title="Editar documento">
        {editingDoc && (
          <DocumentForm
            action={updateDocument.bind(null, editingDoc.id)}
            document={editingDoc}
            onSuccess={() => setEditingDoc(null)}
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
