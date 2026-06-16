import { z } from "zod";

export const choreSchema = z.object({
  title: z.string().min(1, "Este campo es obligatorio."),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  frequency: z.enum(["puntual", "diaria", "semanal", "quincenal", "mensual"]).default("puntual"),
  nextDueDate: z.string().optional(),
});
