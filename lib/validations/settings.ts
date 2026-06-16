import { z } from "zod";

export const householdNameSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio.").max(80, "Máximo 80 caracteres."),
});

export const profileDisplayNameSchema = z.object({
  displayName: z.string().min(1, "Este campo es obligatorio.").max(60, "Máximo 60 caracteres."),
});
