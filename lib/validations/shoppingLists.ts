import { z } from "zod";

export const shoppingListSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio."),
  weekStartDate: z.string().optional(),
  weekEndDate: z.string().optional(),
  plannedBudget: z.coerce.number().positive("Introduce un importe válido.").optional().or(z.literal("")),
  mainStore: z.string().optional(),
});

export const shoppingTripSchema = z.object({
  store: z.string().optional(),
  totalAmount: z.coerce.number().positive("Introduce un importe válido."),
  shoppingDate: z.string().optional(),
});

export const markPurchasedSchema = z.object({
  actualTotal: z.coerce.number().nonnegative("Introduce un importe válido.").optional().or(z.literal("")),
});
