import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { ROLES } from "@/constants/roles";
import type { Tenant } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { TenantMode } from "@/lib/tenant-context";

export type Context = {
  prisma: typeof prisma;
  userId?: string | null;
  headers: Headers;
  tenantId: string | null;
  tenantMode: TenantMode;
  tenant?: Tenant | null;
  memberRole?: string;
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,

  errorFormatter: ({ shape, error }) => {
    const zodError =
      error.code === "BAD_REQUEST" && error.cause instanceof ZodError
        ? error.cause.flatten((issue) => issue.message)
        : null;

    return {
      ...shape,
      zodError,
    };
  },
});

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, userId: ctx.userId! } });
});

/**
 * Middleware que requer tenantId válido (modo tenant)
 */
const requireTenant = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (ctx.tenantMode !== "tenant" || !ctx.tenantId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Esta operação requer um tenant válido",
    });
  }

  // Verifica se o usuário é membro do tenant
  const member = await ctx.prisma.tenantMember.findUnique({
    where: {
      tenantId_userId: {
        tenantId: ctx.tenantId,
        userId: ctx.userId,
      },
    },
  });

  if (!member) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Você não tem acesso a este tenant",
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId!,
      tenantId: ctx.tenantId,
    },
  });
});

/**
 * Middleware que requer modo plataforma (sem tenantId)
 */
const requirePlatform = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (ctx.tenantMode !== "platform" || ctx.tenantId !== null) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Esta operação requer modo plataforma",
    });
  }

  // Verifica se o usuário é Super Admin
  const user = await ctx.prisma.user.findUnique({
    where: { id: ctx.userId },
    select: { role: true },
  });

  if (user?.role !== ROLES.SUPERADMIN) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso negado. Apenas Super Admin pode acessar esta operação",
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId!,
    },
  });
});

/**
 * Middleware que requer Super Admin (modo plataforma + role superadmin)
 */
const requireSuperAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (ctx.tenantMode !== "platform" || ctx.tenantId !== null) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Esta operação requer modo plataforma",
    });
  }

  const user = await ctx.prisma.user.findUnique({
    where: { id: ctx.userId },
    select: { role: true },
  });

  if (user?.role !== ROLES.SUPERADMIN) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso negado. Apenas Super Admin pode acessar esta operação",
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId!,
    },
  });
});

/**
 * Middleware que requer role específica dentro de um tenant
 */
const requireTenantRole = (requiredRole: string) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    if (ctx.tenantMode !== "tenant" || !ctx.tenantId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Esta operação requer um tenant válido",
      });
    }

    // Verifica se o usuário é membro do tenant e tem a role necessária
    const member = await ctx.prisma.tenantMember.findUnique({
      where: {
        tenantId_userId: {
          tenantId: ctx.tenantId,
          userId: ctx.userId,
        },
      },
    });

    if (!member) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Você não tem acesso a este tenant",
      });
    }

    if (member.role !== requiredRole) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Acesso negado. Esta operação requer role: ${requiredRole}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        userId: ctx.userId!,
        tenantId: ctx.tenantId,
        memberRole: member.role,
      },
    });
  });

/**
 * Middleware que requer role ADMIN dentro de um tenant
 */
const requireTenantAdmin = requireTenantRole(ROLES.ADMIN);

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
export const tenantProcedure = t.procedure.use(isAuthed).use(requireTenant);
export const tenantAdminProcedure = t.procedure
  .use(isAuthed)
  .use(requireTenantAdmin);
export const platformProcedure = t.procedure.use(isAuthed).use(requirePlatform);
export const superAdminProcedure = t.procedure
  .use(isAuthed)
  .use(requireSuperAdmin);
