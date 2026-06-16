import { z } from "zod";

export const recipeSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio."),
  description: z.string().optional(),
  prepTimeMinutes: z.coerce.number().int().positive("Introduce un tiempo válido.").optional().or(z.literal("")),
  difficulty: z.enum(["fácil", "media", "difícil"]).optional().or(z.literal("")),
  servings: z.coerce.number().int().positive("Introduce un número válido.").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const ingredientSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio."),
  quantity: z.coerce.number().positive("Introduce una cantidad válida.").optional().or(z.literal("")),
  unit: z.string().optional(),
  categoryId: z.string().optional(),
});
