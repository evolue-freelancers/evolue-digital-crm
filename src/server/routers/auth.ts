import { TRPCError } from "@trpc/server";

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
   * Valida se o usuário pertence ao tenant quando em modo tenant
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

      // Se não conseguiu autenticar, lança erro
      if (!result?.user?.id) {
        throw new Error("Credenciais inválidas");
      }

      const userId = result.user.id;

      // Modo platform (CRM): apenas usuários sem tenant podem fazer login
      if (ctx.tenantMode === "platform") {
        const userTenants = await ctx.prisma.tenantMember.findMany({
          where: { userId },
          select: { id: true },
        });

        // Se o usuário pertence a algum tenant, não pode fazer login no CRM
        if (userTenants.length > 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Usuários de tenant não podem acessar o CRM",
          });
        }
      }

      // Modo tenant: apenas usuários que pertencem àquele tenant específico podem fazer login
      if (ctx.tenantMode === "tenant" && ctx.tenantId) {
        const member = await ctx.prisma.tenantMember.findUnique({
          where: {
            tenantId_userId: {
              tenantId: ctx.tenantId,
              userId,
            },
          },
        });

        if (!member) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Você não tem acesso a este tenant",
          });
        }
      }

      return { success: true, session: result };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
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
