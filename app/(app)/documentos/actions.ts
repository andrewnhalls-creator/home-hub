"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { documentSchema } from "@/lib/validations/documents";
import { upsertScheduledNotification, cancelScheduledNotifications } from "@/lib/notifications";

export interface DocumentFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

function flattenFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

async function scheduleExpiryNotification(
  documentId: string,
  householdId: string,
  title: string,
  expiryDate: string | undefined,
) {
  if (!expiryDate) {
    await cancelScheduledNotifications("household_document", documentId);
    return;
  }
  await upsertScheduledNotification({
    householdId,
    userId: null,
    category: "documentos",
    entityType: "household_document",
    entityId: documentId,
    scheduledFor: new Date(`${expiryDate}T09:00:00`).toISOString(),
    title: "Un documento está a punto de caducar",
    body: title,
  });
}

export async function createDocument(
  _prevState: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> {
  const parsed = documentSchema.safeParse({
    title: formData.get("title"),
    documentType: formData.get("documentType") || undefined,
    provider: formData.get("provider") || undefined,
    expiryDate: formData.get("expiryDate") || undefined,
    renewalDate: formData.get("renewalDate") || undefined,
    storageUrl: formData.get("storageUrl") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("household_documents")
    .insert({
      household_id: householdId,
      title: parsed.data.title,
      document_type: parsed.data.documentType || null,
      provider: parsed.data.provider || null,
      expiry_date: parsed.data.expiryDate || null,
      renewal_date: parsed.data.renewalDate || null,
      storage_url: parsed.data.storageUrl || null,
      notes: parsed.data.notes || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  await scheduleExpiryNotification(data.id, householdId, parsed.data.title, parsed.data.expiryDate);

  revalidatePath("/documentos");
  return { success: true };
}

export async function updateDocument(
  documentId: string,
  _prevState: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> {
  const parsed = documentSchema.safeParse({
    title: formData.get("title"),
    documentType: formData.get("documentType") || undefined,
    provider: formData.get("provider") || undefined,
    expiryDate: formData.get("expiryDate") || undefined,
    renewalDate: formData.get("renewalDate") || undefined,
    storageUrl: formData.get("storageUrl") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { fieldErrors: flattenFieldErrors(parsed.error) };

  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase
    .from("household_documents")
    .update({
      title: parsed.data.title,
      document_type: parsed.data.documentType || null,
      provider: parsed.data.provider || null,
      expiry_date: parsed.data.expiryDate || null,
      renewal_date: parsed.data.renewalDate || null,
      storage_url: parsed.data.storageUrl || null,
      notes: parsed.data.notes || null,
    })
    .eq("id", documentId)
    .eq("household_id", householdId);

  if (error) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  await scheduleExpiryNotification(documentId, householdId, parsed.data.title, parsed.data.expiryDate);

  revalidatePath("/documentos");
  return { success: true };
}

export async function archiveDocument(documentId: string) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  await supabase
    .from("household_documents")
    .update({ archived_at: new Date().toISOString(), archived_by: user.id })
    .eq("id", documentId)
    .eq("household_id", householdId);

  revalidatePath("/documentos");
}

export async function deleteDocument(documentId: string) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  await supabase
    .from("household_documents")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
    .eq("id", documentId)
    .eq("household_id", householdId);

  await cancelScheduledNotifications("household_document", documentId);

  revalidatePath("/documentos");
}
