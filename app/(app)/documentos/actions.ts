"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { documentSchema } from "@/lib/validations/documents";
import { upsertScheduledNotification, cancelScheduledNotifications } from "@/lib/notifications";
import { logActivity } from "@/lib/activity";

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
  void logActivity({ householdId, actorId: user.id, entityType: "household_document", entityId: data.id, action: "created", summary: `Añadió el documento: ${parsed.data.title}` });

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

  const { data: doc } = await supabase.from("household_documents").select("title").eq("id", documentId).single();

  await supabase
    .from("household_documents")
    .update({ archived_at: new Date().toISOString(), archived_by: user.id })
    .eq("id", documentId)
    .eq("household_id", householdId);

  void logActivity({ householdId, actorId: user.id, entityType: "household_document", entityId: documentId, action: "archived", summary: `Archivó el documento: ${doc?.title ?? documentId}` });

  revalidatePath("/documentos");
}

export async function deleteDocument(documentId: string) {
  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: doc } = await supabase.from("household_documents").select("title").eq("id", documentId).single();

  await supabase
    .from("household_documents")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
    .eq("id", documentId)
    .eq("household_id", householdId);

  await cancelScheduledNotifications("household_document", documentId);
  void logActivity({ householdId, actorId: user.id, entityType: "household_document", entityId: documentId, action: "deleted", summary: `Eliminó el documento: ${doc?.title ?? documentId}` });

  revalidatePath("/documentos");
}

export async function restoreDocument(
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const documentId = formData.get("id") as string;
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase
    .from("household_documents")
    .update({ deleted_at: null, deleted_by: null })
    .eq("id", documentId)
    .eq("household_id", householdId);

  if (error) return { error: "No se ha podido restaurar." };

  revalidatePath("/documentos");
  return {};
}

export async function unarchiveDocument(
  _prevState: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const documentId = formData.get("id") as string;
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { error } = await supabase
    .from("household_documents")
    .update({ archived_at: null, archived_by: null })
    .eq("id", documentId)
    .eq("household_id", householdId);

  if (error) return { error: "No se ha podido restaurar." };

  revalidatePath("/documentos");
  return {};
}
