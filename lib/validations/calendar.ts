import { z } from "zod";

export const calendarEventSchema = z
  .object({
    title: z.string().min(1, "Este campo es obligatorio."),
    description: z.string().optional(),
    eventDate: z.string().min(1, "Este campo es obligatorio."),
    endDate: z.string().optional(),
    eventTime: z.string().optional(),
    isAllDay: z.coerce.boolean().default(false),
    repeatFrequency: z.enum(["ninguna", "diaria", "semanal", "mensual", "anual"]).default("ninguna"),
    remindBeforeMinutes: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
    isPrivate: z.coerce.boolean().default(false),
    color: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => !data.endDate || data.endDate >= data.eventDate,
    { message: "La fecha de fin debe ser igual o posterior a la fecha de inicio.", path: ["endDate"] },
  );
