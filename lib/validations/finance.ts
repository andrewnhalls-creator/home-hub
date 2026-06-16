import { z } from "zod";

export const fixedPaymentSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio."),
  amount: z.coerce.number().positive("Introduce un importe válido."),
  categoryId: z.string().optional(),
  dueDay: z.coerce.number().int().min(1).max(31).optional().or(z.literal("")),
  paymentMethod: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
  notes: z.string().optional(),
});

export const expenseSchema = z.object({
  title: z.string().min(1, "Este campo es obligatorio."),
  amount: z.coerce.number().positive("Introduce un importe válido."),
  expenseDate: z.string().min(1, "Este campo es obligatorio."),
  categoryId: z.string().optional(),
  paidBy: z.string().optional(),
  notes: z.string().optional(),
});

export const savingsGoalSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio."),
  targetAmount: z.coerce.number().positive("Introduce un importe válido."),
  targetDate: z.string().optional(),
  priority: z.enum(["baja", "normal", "alta"]).default("normal"),
  notes: z.string().optional(),
});

export const contributionSchema = z.object({
  amount: z.coerce.number().positive("Introduce un importe válido."),
  contributionDate: z.string().optional(),
  notes: z.string().optional(),
});

export const subscriptionSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio."),
  amount: z.coerce.number().positive("Introduce un importe válido."),
  billingCycle: z.enum(["mensual", "trimestral", "anual"]).default("mensual"),
  renewalDate: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.coerce.boolean().default(true),
  notes: z.string().optional(),
});
