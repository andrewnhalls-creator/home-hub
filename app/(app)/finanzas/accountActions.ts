"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export interface AccountActionState {
  error?: string;
  success?: boolean;
}

const balanceSchema = z.object({
  accountId: z.string().uuid(),
  amount: z.coerce.number().min(0, "Introduce un saldo válido."),
});

/**
 * Sets an account's balance anchor to "this amount, today". From that moment
 * the estimated balance moves automatically: + ingresos recibidos − gastos,
 * pagos fijos pagados, hipoteca y aportaciones a ahorro cargados a la cuenta.
 */
export async function setAccountBalance(
  _prevState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const parsed = balanceSchema.safeParse({
    accountId: formData.get("accountId"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) return { error: "Introduce un saldo válido." };

  const { user, householdId } = await requireHousehold();
  const supabase = await createClient();

  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
  const { data, error } = await supabase
    .from("household_accounts")
    .update({
      opening_balance: parsed.data.amount,
      opening_date: today,
      opening_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.accountId)
    .eq("household_id", householdId)
    .select("name");

  if (error || !data?.length) return { error: "No se ha podido guardar. Inténtalo de nuevo." };

  // Amount deliberately omitted from the activity summary (privacy rule).
  void logActivity({ householdId, actorId: user.id, entityType: "household_account", entityId: parsed.data.accountId, action: "balance_set", summary: `Actualizó el saldo de ${data[0].name}` });

  revalidatePath("/finanzas");
  return { success: true };
}
