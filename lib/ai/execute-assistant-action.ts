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

// Currently executes: add_shopping_item, add_task, add_reminder.
// Other actions (update/remove/complete) need safe lookup-by-name logic — TODO wire later.
export async function executeAssistantAction(
  action: AssistantResult,
  ctx: ExecuteContext,
): Promise<ExecuteResult> {
  const { supabase, householdId, userId } = ctx;

  switch (action.action) {
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

    // TODO: update_shopping_item — needs lookup by name, may match multiple rows
    // TODO: remove_shopping_item — needs lookup + soft delete vs hard delete check
    // TODO: complete_task — needs lookup by title in chores table
    // TODO: update_task — needs lookup by title
    // TODO: update_reminder — needs lookup by title
    case "update_shopping_item":
    case "remove_shopping_item":
    case "complete_task":
    case "update_task":
    case "update_reminder":
    case "clarify":
    default:
      return { executed: false };
  }
}
