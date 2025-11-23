import { z } from "zod";

import {
  router,
  tenantAdminProcedure,
  tenantProcedure,
} from "@/server/trpc/init";

export const tenantRouter = router({
  /**
   * Obtém dados do tenant atual
   */
  get: tenantProcedure.query(async ({ ctx }) => {
    if (!ctx.tenantId || !ctx.tenant) {
      throw new Error("Tenant não encontrado");
    }

    return ctx.tenant;
  }),

  /**
   * Atualiza dados do tenant atual
   * Apenas ADMIN do tenant pode atualizar
   */
  update: tenantAdminProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        status: z.enum(["ACTIVE", "TRIAL", "SUSPENDED", "INACTIVE"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.tenantId) {
        throw new Error("Tenant não encontrado");
      }

      const updated = await ctx.prisma.tenant.update({
        where: { id: ctx.tenantId },
        data: input,
      });

      return updated;
    }),
});
