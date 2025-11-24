import { prisma } from "@/lib/prisma";

import type {
  TenantResolutionError,
  TenantResolutionResult,
} from "./tenant-context";
import { adminSubdomain } from "./utils";

/**
 * Resolve o tenant baseado no subdomain
 * Se subdomain não for passado, retorna modo platform
 * Se existir, busca no Prisma pelo slug e retorna tenantId e tenant
 * Se não encontrar, estoura um erro
 */
export async function resolveTenant(
  subdomain?: string | null
): Promise<TenantResolutionResult> {
  // Se subdomain não for passado ou for igual ao adminSubdomain, retorna modo platform
  if (!subdomain || subdomain === adminSubdomain) {
    return {
      tenantId: null,
      tenant: null,
      tenantMode: "platform",
    };
  }

  // Busca tenant pelo slug no banco de dados
  const tenant = await prisma.tenant.findUnique({
    where: { slug: subdomain },
  });

  // Se não encontrar, estoura um erro
  if (!tenant) {
    throw new Error(`Tenant não encontrado para o subdomain: ${subdomain}`);
  }

  // Retorna com tenantId e tenant corretamente
  return {
    tenantId: tenant.id,
    tenant,
    tenantMode: "tenant",
  };
}

/**
 * Valida o resultado da resolução e retorna erro se necessário
 * Observa o status do tenant e retorna erro se estiver SUSPENDED ou INACTIVE
 * Também retorna erro se não encontrar tenant quando em modo tenant
 */
export function validateTenant(
  result: TenantResolutionResult
): TenantResolutionError | null {
  // Se for modo platform, não precisa validar
  if (result.tenantMode === "platform") {
    return null;
  }

  // Se não tiver tenantId ou tenant, retorna erro NOT_FOUND
  if (!result.tenantId || !result.tenant) {
    return {
      type: "NOT_FOUND",
      message: "Tenant não encontrado",
    };
  }

  // Valida status do tenant
  if (result.tenant.status === "SUSPENDED") {
    return {
      type: "SUSPENDED",
      message: "Tenant suspenso",
    };
  }

  if (result.tenant.status === "INACTIVE") {
    return {
      type: "INACTIVE",
      message: "Tenant inativo",
    };
  }

  // Se passou todas as validações, retorna null (sem erro)
  return null;
}

/**
 * Verifica se uma rota é pública (não requer autenticação)
 */
function isPublicRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  );
}

/**
 * Valida se o usuário tem acesso ao tenant
 * Retorna true se o acesso deve ser permitido, false caso contrário
 *
 * Regras:
 * - Modo platform (CRM): apenas usuários sem tenant (superadmin) podem acessar
 * - Modo tenant: apenas usuários que pertencem àquele tenant específico podem acessar
 *
 * @param tenantId - ID do tenant
 * @param tenantMode - Modo do tenant ("platform" ou "tenant")
 * @param userId - ID do usuário autenticado (pode ser null se não autenticado)
 * @param pathname - Caminho da rota atual
 * @returns true se o acesso deve ser permitido, false caso contrário
 */
export async function validateTenantAccess(
  tenantId: string | null,
  tenantMode: "platform" | "tenant",
  userId: string | null,
  pathname: string
): Promise<boolean> {
  // Se for rota pública, permite acesso
  if (isPublicRoute(pathname)) {
    return true;
  }

  // Se não tiver usuário autenticado, permite continuar (será validado no layout protegido)
  if (!userId) {
    return true;
  }

  // Modo platform (CRM): apenas usuários sem tenant podem acessar
  if (tenantMode === "platform") {
    // Verifica se o usuário pertence a algum tenant
    const userTenants = await prisma.tenantMember.findMany({
      where: { userId },
      select: { id: true },
    });

    // Se o usuário pertence a algum tenant, não pode acessar o CRM
    if (userTenants.length > 0) {
      return false;
    }

    // Usuário sem tenant pode acessar o CRM
    return true;
  }

  // Modo tenant: apenas usuários que pertencem àquele tenant específico podem acessar
  if (tenantMode === "tenant" && tenantId) {
    const member = await prisma.tenantMember.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId,
        },
      },
    });

    // Retorna true se for membro, false caso contrário
    return member !== null;
  }

  // Caso padrão: permite acesso
  return true;
}
