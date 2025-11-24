import { prisma } from "@/lib/prisma";

import type {
  TenantResolutionError,
  TenantResolutionResult,
} from "./tenant-context";
import { adminSubdomain } from "./utils";

/**
 * Resolve o tenant baseado no subdomain
 */
export async function resolveTenant(
  subdomain?: string | null
): Promise<TenantResolutionResult> {
  // Plataforma (superadmin)
  if (!subdomain || subdomain === adminSubdomain) {
    return {
      tenantId: null,
      tenant: null,
      tenantMode: "platform",
    };
  }

  // Tenant (cliente)
  const tenant = await prisma.tenant.findUnique({
    where: { slug: subdomain },
  });

  if (!tenant) {
    throw new Error(`Tenant não encontrado para o subdomain: ${subdomain}`);
  }

  return {
    tenantId: tenant.id,
    tenant,
    tenantMode: "tenant",
  };
}

/**
 * Valida status do tenant
 */
export function validateTenant(
  result: TenantResolutionResult
): TenantResolutionError | null {
  if (result.tenantMode === "platform") return null;

  if (!result.tenantId || !result.tenant) {
    return { type: "NOT_FOUND", message: "Tenant não encontrado" };
  }

  if (result.tenant.status === "SUSPENDED") {
    return { type: "SUSPENDED", message: "Tenant suspenso" };
  }

  if (result.tenant.status === "INACTIVE") {
    return { type: "INACTIVE", message: "Tenant inativo" };
  }

  return null;
}

/**
 * Rotas públicas (sem login)
 */
function isPublicRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  );
}

/**
 * Valida se o usuário pode acessar o tenant
 */
export async function validateTenantAccess(
  tenantId: string | null,
  tenantMode: "platform" | "tenant",
  userId: string | null,
  pathname: string
): Promise<boolean> {
  // 1️⃣ Usuário não autenticado → só públicas
  if (!userId) {
    return isPublicRoute(pathname);
  }

  // 2️⃣ Plataforma (CRM) → somente superadmin (sem tenant)
  if (tenantMode === "platform") {
    const membership = await prisma.tenantMember.findMany({
      where: { userId },
      select: { id: true },
    });

    return membership.length === 0; // usuários sem tenant podem acessar
  }

  // 3️⃣ Tenant → deve pertencer ao tenant
  if (tenantMode === "tenant" && tenantId) {
    const member = await prisma.tenantMember.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
    });

    return member !== null;
  }

  return true;
}
