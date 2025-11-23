import { auth } from "@/lib/auth";
import { publicProcedure, router } from "@/server/trpc/init";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "@/validations/auth";

export const authRouter = router({
  /**
   * Login com email e senha
   */
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    try {
      const result = await auth.api.signInEmail({
        body: {
          email: input.email,
          password: input.password,
        },
        headers: ctx.headers,
      });

      return { success: true, session: result };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Credenciais inválidas"
      );
    }
  }),

  /**
   * Solicitar redefinição de senha
   * O Better Auth já envia o email automaticamente via sendResetEmail
   */
  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input }) => {
      try {
        await auth.api.forgetPassword({
          body: {
            email: input.email,
            redirectTo: input.redirectTo,
          },
        });

        // O email já foi enviado automaticamente pelo Better Auth via sendResetEmail
        return { success: true };
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Erro ao enviar email"
        );
      }
    }),

  /**
   * Redefinir senha com token
   */
  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input }) => {
      try {
        await auth.api.resetPassword({
          body: {
            token: input.token,
            newPassword: input.newPassword,
          },
        });

        return { success: true };
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : "Erro ao redefinir senha"
        );
      }
    }),
});
