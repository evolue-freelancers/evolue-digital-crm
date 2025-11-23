import { z } from "zod";

import { ROLES } from "@/constants/roles";
import { protectedProcedure, router } from "@/server/trpc/init";

export const userRouter = router({
  /**
   * Obtém a role atual do usuário
   * - Se estiver em modo plataforma: retorna role do User (superadmin ou null)
   * - Se estiver em modo tenant: retorna role do TenantMember (admin ou member)
   */
  getCurrentRole: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      return null;
    }

    // Modo plataforma: busca role do User
    if (ctx.tenantMode === "platform") {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.userId },
        select: { role: true },
      });

      return user?.role || null;
    }

    // Modo tenant: busca role do TenantMember
    if (ctx.tenantMode === "tenant" && ctx.tenantId) {
      const member = await ctx.prisma.tenantMember.findUnique({
        where: {
          tenantId_userId: {
            tenantId: ctx.tenantId,
            userId: ctx.userId,
          },
        },
        select: { role: true },
      });

      return member?.role || null;
    }

    return null;
  }),

  /**
   * Verifica se o usuário atual tem uma role específica
   */
  hasRole: protectedProcedure
    .input(
      z.object({ role: z.enum([ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.MEMBER]) })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.userId) {
        return false;
      }

      // Modo plataforma: verifica role do User
      if (ctx.tenantMode === "platform") {
        const user = await ctx.prisma.user.findUnique({
          where: { id: ctx.userId },
          select: { role: true },
        });

        return user?.role === input.role;
      }

      // Modo tenant: verifica role do TenantMember
      if (ctx.tenantMode === "tenant" && ctx.tenantId) {
        const member = await ctx.prisma.tenantMember.findUnique({
          where: {
            tenantId_userId: {
              tenantId: ctx.tenantId,
              userId: ctx.userId,
            },
          },
          select: { role: true },
        });

        return member?.role === input.role;
      }

      return false;
    }),
});
