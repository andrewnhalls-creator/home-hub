import { z } from "zod";

const bankAccountSchema = z.enum(["ING", "BBVA", "Revolut"]).optional().or(z.literal(""));

export const fixedPaymentSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio."),
  amount: z.coerce.number().positive("Introduce un importe válido."),
  categoryId: z.string().optional(),
  dueDay: z.coerce.number().int().min(1).max(31).optional().or(z.literal("")),
  paymentMethod: z.string().optional(),
  bankAccount: bankAccountSchema,
  isActive: z.coerce.boolean().default(true),
  notes: z.string().optional(),
});

export const expenseSchema = z.object({
  title: z.string().min(1, "Este campo es obligatorio."),
  amount: z.coerce.number().positive("Introduce un importe válido."),
  expenseDate: z.string().min(1, "Este campo es obligatorio."),
  categoryId: z.string().optional(),
  paidBy: z.string().optional(),
  bankAccount: bankAccountSchema,
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
  bankAccount: bankAccountSchema,
  notes: z.string().optional(),
});

export const subscriptionSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio."),
  amount: z.coerce.number().positive("Introduce un importe válido."),
  billingCycle: z.enum(["mensual", "trimestral", "anual", "otro"]).default("mensual"),
  renewalDate: z.string().optional(),
  categoryId: z.string().optional(),
  bankAccount: bankAccountSchema,
  isActive: z.coerce.boolean().default(true),
  notes: z.string().optional(),
  billingDay: z.coerce.number().int().min(1).max(31).optional().or(z.literal("")),
  billingIntervalDays: z.coerce.number().int().min(1).optional().or(z.literal("")),
  lastPaymentDate: z.string().optional(),
  startDate: z.string().optional(),
});

export const incomeSourceSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio."),
  amount: z.coerce.number().positive("Introduce un importe válido."),
  frequency: z.enum(["mensual", "trimestral", "anual", "quincenal"]).default("mensual"),
  earnerName: z.string().optional(),
  paymentDay: z.coerce.number().int().min(1).max(31).optional().or(z.literal("")),
  bankAccount: bankAccountSchema,
  isActive: z.coerce.boolean().default(true),
  notes: z.string().optional(),
});

export const debtSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio."),
  balance: z.coerce.number().min(0, "Introduce un saldo válido."),
  monthlyPayment: z.coerce.number().positive("Introduce un importe válido.").optional().or(z.literal("")),
  paymentDay: z.coerce.number().int().min(1).max(31).optional().or(z.literal("")),
  interestRate: z.coerce.number().min(0).max(100).optional().or(z.literal("")),
  lender: z.string().optional(),
  startDate: z.string().optional(),
  notes: z.string().optional(),
});

export const mortgageSchema = z.object({
  name: z.string().min(1, "Este campo es obligatorio."),
  lender: z.string().optional(),
  originalPrincipal: z.coerce.number().positive("Introduce un importe válido."),
  currentBalance: z.coerce.number().min(0, "El saldo no puede ser negativo."),
  monthlyPayment: z.coerce.number().positive("Introduce un importe válido."),
  interestRate: z.coerce.number().min(0).max(100).optional().or(z.literal("")),
  rateType: z.enum(["fijo", "variable", "mixto"]).default("fijo"),
  euriborSpread: z.coerce.number().min(0).max(20).optional().or(z.literal("")),
  fixedPeriodEndDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  paymentDay: z.coerce.number().int().min(1).max(31).optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const categoryBudgetSchema = z.object({
  categoryId: z.string().uuid("Selecciona una categoría."),
  monthlyAmount: z.coerce.number().positive("Introduce un importe válido."),
  notes: z.string().optional(),
});

export const mortgagePaymentSchema = z.object({
  mortgageId: z.string().uuid(),
  dueDate: z.string().min(1, "Este campo es obligatorio."),
  paidDate: z.string().optional(),
  amount: z.coerce.number().positive("Introduce un importe válido."),
  principalAmount: z.coerce.number().min(0).optional().or(z.literal("")),
  interestAmount: z.coerce.number().min(0).optional().or(z.literal("")),
  extraPayment: z.coerce.number().min(0).optional().or(z.literal("")),
  status: z.enum(["pendiente", "pagado", "omitido"]).default("pendiente"),
  notes: z.string().optional(),
});
