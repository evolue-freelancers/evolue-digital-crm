import { z } from "zod";

/**
 * Schema de validação para login
 */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/**
 * Schema de validação para solicitar redefinição de senha (formulário - apenas email)
 */
export const forgotPasswordFormSchema = z.object({
  email: z.string().email(),
});

/**
 * Schema de validação para solicitar redefinição de senha (tRPC - inclui redirectTo)
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email(),
  redirectTo: z.string().url(),
});

/**
 * Schema de validação para redefinir senha (formulário - inclui confirmPassword)
 */
export const resetPasswordFormSchema = z
  .object({
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

/**
 * Schema de validação para redefinir senha (tRPC - inclui token)
 */
export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
});
