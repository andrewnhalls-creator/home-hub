import { z } from "zod";

export const wishlistItemSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio."),
  estimatedCost: z.coerce.number().positive("Introduce un importe válido.").optional().or(z.literal("")),
  priority: z.enum(["baja", "normal", "alta"]).default("normal"),
  targetMonth: z.string().optional(),
  url: z.string().optional(),
  status: z.enum(["idea", "aprobado", "comprado", "descartado"]).default("idea"),
  notes: z.string().optional(),
});
