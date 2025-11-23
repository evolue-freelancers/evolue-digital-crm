import { TRPCError } from "@trpc/server";

import type { Context } from "@/server/trpc/init";

/**
 * Valida que o tenantId do contexto corresponde ao tenantId do recurso
 * Lança erro FORBIDDEN se não corresponder
 *
 * @example
 * ```ts
 * const contact = await ctx.prisma.contact.findUnique({ where: { id } });
 * ensureTenantAccess(ctx, contact.tenantId);
 * ```
 */
export function ensureTenantAccess(
  ctx: Context,
  resourceTenantId: string | null
): void {
  if (ctx.tenantMode !== "tenant") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Esta operação requer modo tenant",
    });
  }

  if (!ctx.tenantId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "TenantId não encontrado no contexto",
    });
  }

  if (resourceTenantId !== ctx.tenantId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso negado: recurso pertence a outro tenant",
    });
  }
}

/**
 * Retorna um filtro de tenant para uso em queries Prisma
 * Útil para garantir que queries sempre filtram por tenantId quando em modo tenant
 *
 * @example
 * ```ts
 * const contacts = await ctx.prisma.contact.findMany({
 *   where: {
 *     ...getTenantFilter(ctx),
 *     // outros filtros...
 *   },
 * });
 * ```
 */
export function getTenantFilter(
  ctx: Context
): { tenantId: string } | Record<string, never> {
  if (ctx.tenantMode === "tenant" && ctx.tenantId) {
    return { tenantId: ctx.tenantId };
  }

  // Retorna objeto vazio se não estiver em modo tenant
  // Isso permite que queries funcionem tanto em modo tenant quanto plataforma
  return {};
}

/**
 * Valida que uma operação está sendo executada em modo tenant
 * Lança erro se não estiver em modo tenant
 *
 * @example
 * ```ts
 * requireTenantMode(ctx);
 * const contacts = await ctx.prisma.contact.findMany({
 *   where: { tenantId: ctx.tenantId },
 * });
 * ```
 */
export function requireTenantMode(ctx: Context): asserts ctx is Context & {
  tenantMode: "tenant";
  tenantId: string;
} {
  if (ctx.tenantMode !== "tenant" || !ctx.tenantId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Esta operação requer modo tenant",
    });
  }
}

/**
 * Padrões de uso para multi-tenancy com Prisma:
 *
 * 1. Sempre use getTenantFilter() em queries quando em modo tenant:
 *    ```ts
 *    const items = await ctx.prisma.item.findMany({
 *      where: {
 *        ...getTenantFilter(ctx),
 *        status: "ACTIVE",
 *      },
 *    });
 *    ```
 *
 * 2. Use ensureTenantAccess() antes de operações críticas:
 *    ```ts
 *    const item = await ctx.prisma.item.findUnique({ where: { id } });
 *    ensureTenantAccess(ctx, item?.tenantId);
 *    await ctx.prisma.item.update({ where: { id }, data });
 *    ```
 *
 * 3. Use requireTenantMode() quando precisar garantir modo tenant:
 *    ```ts
 *    requireTenantMode(ctx);
 *    // Agora ctx.tenantId está garantido como string
 *    ```
 *
 * 4. Em modo plataforma, não use filtros de tenant:
 *    ```ts
 *    if (ctx.tenantMode === "platform") {
 *      // Acesso a todos os tenants
 *    } else {
 *      // Acesso apenas ao tenant atual
 *    }
 *    ```
 */
