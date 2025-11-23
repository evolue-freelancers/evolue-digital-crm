import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getBaseDomain,
  normalizeHost,
  resolveTenantId,
} from "@/lib/tenant-resolver";

import type { Context } from "./init";

export async function createTRPCContext({
  headers,
}: {
  headers: Headers;
}): Promise<Context> {
  const session = await auth.api.getSession({ headers }).catch(() => null);

  const userId = session?.user?.id ?? null;

  // Resolve tenant context from headers (fallback to direct resolution)
  let tenantId: string | null = headers.get("x-tenant-id");
  let tenantMode: "platform" | "tenant" | null = (headers.get(
    "x-tenant-mode"
  ) || null) as "platform" | "tenant" | null;
  let tenant = null;

  // Se os headers não foram definidos pelo middleware, resolve diretamente pelo hostname
  if (!tenantMode) {
    const hostname = normalizeHost(headers);
    const baseDomain = getBaseDomain();
    const tenantResult = await resolveTenantId(hostname, baseDomain);
    tenantId = tenantResult.tenantId;
    tenantMode = tenantResult.mode;
    tenant = tenantResult.tenant; // Já vem carregado do resolveTenantId
  } else if (tenantId) {
    // Se veio do header, precisa buscar o tenant
    try {
      tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });
    } catch (error) {
      console.error("Error loading tenant:", error);
    }
  }

  return {
    prisma,
    userId,
    headers,
    tenantId: tenantId || null,
    tenantMode: tenantMode || "tenant",
    tenant,
  };
}
