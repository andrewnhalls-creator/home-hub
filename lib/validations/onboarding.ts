import { z } from "zod";

export const createHouseholdSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio."),
});

export const joinHouseholdSchema = z.object({
  code: z.string().min(1, "Este campo es obligatorio."),
});
