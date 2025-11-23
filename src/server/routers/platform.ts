import { z } from "zod";

import { ROLES } from "@/constants/roles";
import { auth } from "@/lib/auth";
import { router, superAdminProcedure } from "@/server/trpc/init";

export const platformRouter = router({
  /**
   * Lista todos os tenants (Super Admin apenas)
   */
  tenants: router({
    list: superAdminProcedure.query(async ({ ctx }) => {
      const tenants = await ctx.prisma.tenant.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              members: true,
              domains: true,
            },
          },
        },
      });

      return tenants;
    }),

    /**
     * Cria um novo tenant com usuário admin
     */
    create: superAdminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          slug: z
            .string()
            .min(1)
            .regex(/^[a-z0-9-]+$/),
          status: z
            .enum(["ACTIVE", "TRIAL", "SUSPENDED", "INACTIVE"])
            .default("TRIAL"),
          email: z.string().email(),
          password: z.string().min(6),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { auth } = await import("@/lib/auth");
        const { ROLES } = await import("@/constants/roles");

        // Cria o tenant
        const tenant = await ctx.prisma.tenant.create({
          data: {
            name: input.name,
            slug: input.slug,
            status: input.status,
          },
        });

        // Cria o domínio subdomínio padrão
        const baseDomain =
          process.env.NEXT_PUBLIC_BASE_DOMAIN || "evolue.com.br";
        await ctx.prisma.domain.create({
          data: {
            tenantId: tenant.id,
            hostname: `${input.slug}.${baseDomain}`,
          },
        });

        // Cria o usuário usando Better Auth
        const userResult = await auth.api.createUser({
          body: {
            email: input.email,
            password: input.password,
            name: input.name,
          },
        });

        if (!userResult?.user) {
          // Se falhar ao criar usuário, remove o tenant criado
          await ctx.prisma.tenant.delete({ where: { id: tenant.id } });
          throw new Error("Falha ao criar usuário");
        }

        const user = userResult.user;

        // Atualiza o usuário para ter email verificado
        await ctx.prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: true,
          },
        });

        // Cria o TenantMember com role ADMIN
        await ctx.prisma.tenantMember.create({
          data: {
            tenantId: tenant.id,
            userId: user.id,
            role: ROLES.ADMIN,
          },
        });

        return tenant;
      }),

    /**
     * Atualiza um tenant
     */
    update: superAdminProcedure
      .input(
        z.object({
          id: z.string().uuid(),
          name: z.string().min(1).optional(),
          slug: z
            .string()
            .min(1)
            .regex(/^[a-z0-9-]+$/)
            .optional(),
          status: z
            .enum(["ACTIVE", "TRIAL", "SUSPENDED", "INACTIVE"])
            .optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;

        const updated = await ctx.prisma.tenant.update({
          where: { id },
          data,
        });

        return updated;
      }),

    /**
     * Deleta um tenant
     */
    delete: superAdminProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        await ctx.prisma.tenant.delete({
          where: { id: input.id },
        });

        return { success: true };
      }),

    /**
     * Obtém um tenant específico
     */
    get: superAdminProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const tenant = await ctx.prisma.tenant.findUnique({
          where: { id: input.id },
          include: {
            domains: true,
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        });

        if (!tenant) {
          throw new Error("Tenant não encontrado");
        }

        return tenant;
      }),
  }),

  /**
   * Gestão de domínios de um tenant
   */
  domains: router({
    /**
     * Lista domínios de um tenant
     */
    list: superAdminProcedure
      .input(z.object({ tenantId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const domains = await ctx.prisma.domain.findMany({
          where: { tenantId: input.tenantId },
          orderBy: { createdAt: "desc" },
        });

        return domains;
      }),

    /**
     * Adiciona um domínio customizado a um tenant
     */
    add: superAdminProcedure
      .input(
        z.object({
          tenantId: z.string().uuid(),
          hostname: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const domain = await ctx.prisma.domain.create({
          data: {
            tenantId: input.tenantId,
            hostname: input.hostname,
          },
        });

        return domain;
      }),

    /**
     * Remove um domínio
     */
    remove: superAdminProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        await ctx.prisma.domain.delete({
          where: { id: input.id },
        });

        return { success: true };
      }),
  }),

  /**
   * Gestão de membros de um tenant
   */
  members: router({
    /**
     * Lista membros de um tenant
     */
    list: superAdminProcedure
      .input(z.object({ tenantId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const members = await ctx.prisma.tenantMember.findMany({
          where: { tenantId: input.tenantId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        return members;
      }),

    /**
     * Adiciona um membro a um tenant
     */
    add: superAdminProcedure
      .input(
        z.object({
          tenantId: z.string().uuid(),
          userId: z.string().uuid(),
          role: z.enum([ROLES.ADMIN, ROLES.MEMBER]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const member = await ctx.prisma.tenantMember.create({
          data: {
            tenantId: input.tenantId,
            userId: input.userId,
            role: input.role,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return member;
      }),

    /**
     * Atualiza a role de um membro
     */
    update: superAdminProcedure
      .input(
        z.object({
          id: z.string().uuid(),
          role: z.enum([ROLES.ADMIN, ROLES.MEMBER]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const member = await ctx.prisma.tenantMember.update({
          where: { id: input.id },
          data: { role: input.role },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return member;
      }),

    /**
     * Remove um membro de um tenant
     */
    remove: superAdminProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        await ctx.prisma.tenantMember.delete({
          where: { id: input.id },
        });

        return { success: true };
      }),

    /**
     * Cria um novo usuário e adiciona como membro do tenant
     */
    createUserAndAdd: superAdminProcedure
      .input(
        z.object({
          tenantId: z.string().uuid(),
          email: z.string().email(),
          password: z.string().min(6),
          name: z.string().min(1),
          role: z.enum([ROLES.ADMIN, ROLES.MEMBER]),
          emailVerified: z.boolean().default(true),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Cria o usuário usando Better Auth
        const result = await auth.api.createUser({
          body: {
            email: input.email,
            password: input.password,
            name: input.name,
          },
        });

        if (!result?.user) {
          throw new Error("Falha ao criar usuário");
        }

        const user = result.user;

        // Atualiza campos adicionais
        await ctx.prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: input.emailVerified,
          },
        });

        // Adiciona o usuário como membro do tenant
        const member = await ctx.prisma.tenantMember.create({
          data: {
            tenantId: input.tenantId,
            userId: user.id,
            role: input.role,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return member;
      }),
  }),
});
