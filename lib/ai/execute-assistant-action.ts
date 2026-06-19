import type { SupabaseClient } from "@supabase/supabase-js";
import type { AssistantResult } from "@/lib/ai/action-schema";
import { revalidatePath } from "next/cache";

export interface ExecuteContext {
  supabase: SupabaseClient;
  householdId: string;
  userId: string;
}

export interface ExecuteResult {
  executed: boolean;
  error?: string;
}

function advanceDueDate(date: string, frequency: string): string {
  const d = new Date(`${date}T00:00:00`);
  switch (frequency) {
    case "diaria":   d.setDate(d.getDate() + 1);   break;
    case "semanal":  d.setDate(d.getDate() + 7);   break;
    case "quincenal":d.setDate(d.getDate() + 14);  break;
    case "mensual":  d.setMonth(d.getMonth() + 1); break;
  }
  return d.toISOString().slice(0, 10);
}

export async function executeAssistantAction(
  action: AssistantResult,
  ctx: ExecuteContext,
): Promise<ExecuteResult> {
  const { supabase, householdId, userId } = ctx;

  switch (action.action) {
    // ── Shopping items ────────────────────────────────────────────────────────

    case "add_shopping_item": {
      const item = action.payload.item as string | undefined;
      if (!item) return { executed: false, error: "item is required" };

      const { error } = await supabase.from("shopping_items").insert({
        household_id: householdId,
        name: item,
        quantity: (action.payload.quantity as number | null) ?? null,
        unit: null,
        store: null,
        priority: "normal",
        created_by: userId,
      });

      if (error) return { executed: false, error: error.message };
      revalidatePath("/compra");
      return { executed: true };
    }

    case "remove_shopping_item": {
      const item = action.payload.item as string | undefined;
      if (!item) return { executed: false, error: "item is required" };

      const lower = item.toLowerCase();
      const isAll = lower.includes("todo") || lower.includes("all") || lower.includes("todos");

      if (isAll) {
        const { error } = await supabase
          .from("shopping_items")
          .delete()
          .eq("household_id", householdId)
          .eq("is_completed", false);
        if (error) return { executed: false, error: error.message };
      } else {
        const { data: found } = await supabase
          .from("shopping_items")
          .select("id")
          .eq("household_id", householdId)
          .eq("is_completed", false)
          .ilike("name", item)
          .limit(1);

        if (!found?.length) {
          return { executed: false, error: `No se encontró "${item}" en la lista de la compra` };
        }

        const { error } = await supabase
          .from("shopping_items")
          .delete()
          .eq("id", found[0].id)
          .eq("household_id", householdId);
        if (error) return { executed: false, error: error.message };
      }

      revalidatePath("/compra");
      return { executed: true };
    }

    case "update_shopping_item": {
      const item = action.payload.item as string | undefined;
      const updates = action.payload.updates as Record<string, unknown> | undefined;
      if (!item) return { executed: false, error: "item is required" };

      const { data: found } = await supabase
        .from("shopping_items")
        .select("id")
        .eq("household_id", householdId)
        .eq("is_completed", false)
        .ilike("name", item)
        .limit(1);

      if (!found?.length) {
        return { executed: false, error: `No se encontró "${item}" en la lista de la compra` };
      }

      const patch: Record<string, unknown> = {};
      if (updates?.quantity  !== undefined) patch.quantity  = updates.quantity;
      if (updates?.unit      !== undefined) patch.unit      = updates.unit;
      if (updates?.store     !== undefined) patch.store     = updates.store;
      if (updates?.notes     !== undefined) patch.notes     = updates.notes;
      if (updates?.priority  !== undefined) patch.priority  = updates.priority;

      if (Object.keys(patch).length === 0) {
        return { executed: false, error: "No hay campos que actualizar" };
      }

      const { error } = await supabase
        .from("shopping_items")
        .update(patch)
        .eq("id", found[0].id)
        .eq("household_id", householdId);
      if (error) return { executed: false, error: error.message };

      revalidatePath("/compra");
      return { executed: true };
    }

    // ── Tasks (chores) ────────────────────────────────────────────────────────

    case "add_task": {
      const title = action.payload.title as string | undefined;
      if (!title) return { executed: false, error: "title is required" };

      const { error } = await supabase.from("chores").insert({
        household_id: householdId,
        title,
        description: (action.payload.description as string | null) ?? null,
        frequency: (action.payload.frequency as string | null) ?? "puntual",
        next_due_date: (action.payload.next_due_date as string | null) ?? null,
        status: "pendiente",
        created_by: userId,
      });

      if (error) return { executed: false, error: error.message };
      revalidatePath("/tareas");
      return { executed: true };
    }

    case "complete_task": {
      const title = action.payload.title as string | undefined;
      if (!title) return { executed: false, error: "title is required" };

      const { data: found } = await supabase
        .from("chores")
        .select("id, frequency, next_due_date")
        .eq("household_id", householdId)
        .in("status", ["pendiente", "vencido"])
        .ilike("title", title)
        .limit(1);

      if (!found?.length) {
        return { executed: false, error: `No se encontró la tarea "${title}"` };
      }

      const chore = found[0];

      if (chore.frequency === "puntual" || !chore.next_due_date) {
        const { error } = await supabase
          .from("chores")
          .update({ status: "hecho" })
          .eq("id", chore.id)
          .eq("household_id", householdId);
        if (error) return { executed: false, error: error.message };
      } else {
        // Recurring: advance to next occurrence
        const nextDate = advanceDueDate(chore.next_due_date, chore.frequency as string);
        const { error } = await supabase
          .from("chores")
          .update({ status: "pendiente", next_due_date: nextDate })
          .eq("id", chore.id)
          .eq("household_id", householdId);
        if (error) return { executed: false, error: error.message };
      }

      revalidatePath("/tareas");
      return { executed: true };
    }

    case "update_task": {
      const title = action.payload.title as string | undefined;
      const updates = action.payload.updates as Record<string, unknown> | undefined;
      if (!title) return { executed: false, error: "title is required" };

      const { data: found } = await supabase
        .from("chores")
        .select("id")
        .eq("household_id", householdId)
        .in("status", ["pendiente", "vencido"])
        .ilike("title", title)
        .limit(1);

      if (!found?.length) {
        return { executed: false, error: `No se encontró la tarea "${title}"` };
      }

      const patch: Record<string, unknown> = {};
      if (updates?.title         !== undefined) patch.title         = updates.title;
      if (updates?.description   !== undefined) patch.description   = updates.description;
      if (updates?.frequency     !== undefined) patch.frequency     = updates.frequency;
      if (updates?.next_due_date !== undefined) patch.next_due_date = updates.next_due_date;

      if (Object.keys(patch).length === 0) {
        return { executed: false, error: "No hay campos que actualizar" };
      }

      const { error } = await supabase
        .from("chores")
        .update(patch)
        .eq("id", found[0].id)
        .eq("household_id", householdId);
      if (error) return { executed: false, error: error.message };

      revalidatePath("/tareas");
      return { executed: true };
    }

    // ── Reminders ─────────────────────────────────────────────────────────────

    case "add_reminder": {
      const title = action.payload.title as string | undefined;
      if (!title) return { executed: false, error: "title is required" };

      const { error } = await supabase.from("reminders").insert({
        household_id: householdId,
        title,
        description: null,
        due_at: (action.payload.due_at as string | null) ?? null,
        status: "pendiente",
        created_by: userId,
      });

      if (error) return { executed: false, error: error.message };
      revalidatePath("/recordatorios");
      return { executed: true };
    }

    case "update_reminder": {
      const title = action.payload.title as string | undefined;
      const updates = action.payload.updates as Record<string, unknown> | undefined;
      if (!title) return { executed: false, error: "title is required" };

      const { data: found } = await supabase
        .from("reminders")
        .select("id")
        .eq("household_id", householdId)
        .eq("status", "pendiente")
        .is("deleted_at", null)
        .ilike("title", title)
        .limit(1);

      if (!found?.length) {
        return { executed: false, error: `No se encontró el recordatorio "${title}"` };
      }

      const patch: Record<string, unknown> = {};
      if (updates?.due_at      !== undefined) patch.due_at      = updates.due_at;
      if (updates?.title       !== undefined) patch.title       = updates.title;
      if (updates?.description !== undefined) patch.description = updates.description;

      if (Object.keys(patch).length === 0) {
        return { executed: false, error: "No hay campos que actualizar" };
      }

      const { error } = await supabase
        .from("reminders")
        .update(patch)
        .eq("id", found[0].id)
        .eq("household_id", householdId);
      if (error) return { executed: false, error: error.message };

      revalidatePath("/recordatorios");
      return { executed: true };
    }

    case "clarify":
    default:
      return { executed: false };
  }
}
