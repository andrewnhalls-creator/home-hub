import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DocumentsList } from "@/components/documents/DocumentsList";
import { TrashSection } from "@/components/ui/TrashSection";
import { restoreDocument, unarchiveDocument } from "./actions";

export default async function DocumentsPage() {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const [{ data: documents }, { data: archived }, { data: deleted }] = await Promise.all([
    supabase
      .from("household_documents")
      .select("*")
      .eq("household_id", householdId)
      .is("deleted_at", null)
      .is("archived_at", null)
      .order("expiry_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("household_documents")
      .select("id, title, doc_type, archived_at")
      .eq("household_id", householdId)
      .is("deleted_at", null)
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: false }),
    supabase
      .from("household_documents")
      .select("id, title, doc_type, deleted_at")
      .eq("household_id", householdId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
  ]);

  const archiveItems = (archived ?? []).map((d) => ({
    id: d.id,
    label: d.title,
    sublabel: d.doc_type ?? undefined,
    deletedAt: d.archived_at as string,
  }));

  const trashItems = (deleted ?? []).map((d) => ({
    id: d.id,
    label: d.title,
    sublabel: d.doc_type ?? undefined,
    deletedAt: d.deleted_at as string,
  }));

  return (
    <>
      <DocumentsList documents={documents ?? []} />
      <div className="pb-6">
        <TrashSection
          title="Documentos archivados"
          items={archiveItems}
          restoreAction={unarchiveDocument}
          emptyMessage="No hay documentos archivados"
        />
        <TrashSection
          title="Papelera de documentos"
          items={trashItems}
          restoreAction={restoreDocument}
          emptyMessage="No hay documentos eliminados"
        />
      </div>
    </>
  );
}
