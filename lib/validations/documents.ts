import { z } from "zod";

export const documentSchema = z.object({
  title: z.string().min(1, "Este campo es obligatorio."),
  documentType: z.string().optional(),
  provider: z.string().optional(),
  expiryDate: z.string().optional(),
  renewalDate: z.string().optional(),
  storageUrl: z.string().optional(),
  notes: z.string().optional(),
});
