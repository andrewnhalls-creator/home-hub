import { z } from "zod";

export const mealPlanSchema = z
  .object({
    plannedDate: z.string().min(1),
    mealType: z.enum(["desayuno", "comida", "cena", "snack"]),
    recipeId: z.string().optional(),
    customName: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => !!data.recipeId || !!data.customName, {
    message: "Elige una receta o escribe un nombre.",
    path: ["customName"],
  });
