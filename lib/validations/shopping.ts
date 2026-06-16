import { z } from "zod";

export const shoppingItemSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio."),
  quantity: z.coerce.number().positive("Introduce una cantidad válida.").optional().or(z.literal("")),
  unit: z.string().optional(),
  categoryId: z.string().optional(),
  store: z.string().optional(),
  priority: z.enum(["baja", "normal", "alta"]).default("normal"),
  notes: z.string().optional(),
});
