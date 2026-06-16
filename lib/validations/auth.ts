import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Este campo es obligatorio.").email("Introduce un correo electrónico válido."),
  password: z.string().min(1, "Este campo es obligatorio."),
});

export const signupSchema = z.object({
  displayName: z.string().min(1, "Este campo es obligatorio."),
  email: z.string().min(1, "Este campo es obligatorio.").email("Introduce un correo electrónico válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});
