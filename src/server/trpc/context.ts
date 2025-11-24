import type { Tenant } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { TenantMode } from "@/lib/tenant-context";
import { resolveTenant } from "@/lib/tenant-resolver";

import type { Context } from "./init";

// Constantes para nomes dos headers (evita typos e facilita manutenção)
const HEADER_TENANT_ID = "x-tenant-id";
const HEADER_TENANT_MODE = "x-tenant-mode";
const HEADER_SUBDOMAIN = "x-subdomain";

type TenantHeaders = {
  tenantId: string | null;
  tenantMode: TenantMode | null;
  subdomain: string | null;
};

type TenantResolution = {
  tenantId: string | null;
  tenantMode: TenantMode;
  tenant: Tenant | null;
};

/**
 * Extrai informações de tenant dos headers HTTP
 */
function getTenantFromHeaders(headers: Headers): TenantHeaders {
  return {
    tenantId: headers.get(HEADER_TENANT_ID),
    tenantMode: headers.get(HEADER_TENANT_MODE) as TenantMode | null,
    subdomain: headers.get(HEADER_SUBDOMAIN),
  };
}

/**
 * Resolve tenant pelo subdomain (fallback quando não vem do header)
 */
async function resolveTenantFromSubdomain(
  subdomain: string | null
): Promise<TenantResolution | null> {
  if (!subdomain) return null;

  try {
    const resolved = await resolveTenant(subdomain);
    return {
      tenantId: resolved.tenantId,
      tenantMode: resolved.tenantMode,
      tenant: resolved.tenant,
    };
  } catch {
    return null;
  }
}

/**
 * Carrega tenant completo do banco de dados pelo ID
 */
async function loadTenantById(tenantId: string): Promise<Tenant | null> {
  try {
    return await prisma.tenant.findUnique({
      where: { id: tenantId },
    });
  } catch {
    return null;
  }
}

/**
 * Resolve informações do tenant (ID, modo e objeto completo)
 */
async function resolveTenantInfo(
  headers: TenantHeaders
): Promise<TenantResolution> {
  const { tenantId, tenantMode, subdomain } = headers;

  // Se já tem tenantId do header, usa ele
  if (tenantId) {
    const tenant = await loadTenantById(tenantId);
    return {
      tenantId,
      tenantMode: tenantMode || "tenant",
      tenant,
    };
  }

  // Tenta resolver pelo subdomain (fallback para chamadas diretas)
  const resolved = await resolveTenantFromSubdomain(subdomain);
  if (resolved) {
    return resolved;
  }

  // Fallback: modo platform sem tenant
  return {
    tenantId: null,
    tenantMode: tenantMode || "platform",
    tenant: null,
  };
}

/**
 * Cria o contexto do tRPC com informações de autenticação e tenant
 */
export async function createTRPCContext({
  headers,
}: {
  headers: Headers;
}): Promise<Context> {
  const session = await auth.api.getSession({ headers }).catch(() => null);
  const userId = session?.user?.id ?? null;

  const tenantHeaders = getTenantFromHeaders(headers);
  const tenantInfo = await resolveTenantInfo(tenantHeaders);

  return {
    prisma,
    userId,
    headers,
    tenantId: tenantInfo.tenantId,
    tenantMode: tenantInfo.tenantMode,
    tenant: tenantInfo.tenant,
  };
}
