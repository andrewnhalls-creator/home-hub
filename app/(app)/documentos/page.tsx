import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DocumentsList } from "@/components/documents/DocumentsList";

export default async function DocumentsPage() {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: documents } = await supabase
    .from("household_documents")
    .select("*")
    .eq("household_id", householdId)
    .is("deleted_at", null)
    .is("archived_at", null)
    .order("expiry_date", { ascending: true, nullsFirst: false });

  return <DocumentsList documents={documents ?? []} />;
}
