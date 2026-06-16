import { z } from "zod";

export const reminderSchema = z.object({
  title: z.string().min(1, "Este campo es obligatorio."),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  assignedTo: z.string().optional(),
  categoryId: z.string().optional(),
  repeatFrequency: z.enum(["ninguna", "diaria", "semanal", "mensual", "anual"]).default("ninguna"),
});
