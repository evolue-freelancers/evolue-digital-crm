import { prisma } from "@/lib/prisma";
import type {
  TenantResolutionError,
  TenantResolutionResult,
} from "@/lib/tenant-context";

/**
 * Obtém o domínio base da aplicação
 * Em desenvolvimento, suporta *.lvh.me:3000
 * Em produção, usa NEXT_PUBLIC_BASE_DOMAIN
 */
export function getBaseDomain(): string {
  // Server-side: usa variável de ambiente ou fallback
  return process.env.NEXT_PUBLIC_BASE_DOMAIN || "evolue.com.br";
}

/**
 * Normaliza o hostname da requisição
 * Remove porta, www, e converte para lowercase
 */
export function normalizeHost(headers: Headers): string {
  const host =
    headers.get("host") ||
    headers.get("x-forwarded-host") ||
    headers.get("x-vercel-deployment-url") ||
    "";

  if (!host) {
    return "";
  }

  // Remove porta (ex: :3000)
  let normalized = host.split(":")[0];

  // Remove www. prefix
  if (normalized.startsWith("www.")) {
    normalized = normalized.slice(4);
  }

  return normalized.toLowerCase();
}

/**
 * Resolve o tenantId baseado no hostname
 * Busca diretamente no banco de dados pelo hostname (subdomínio ou domínio personalizado)
 * Se não encontrar e for app.{baseDomain}, retorna modo plataforma
 */
export async function resolveTenantId(
  hostname: string,
  baseDomain: string
): Promise<TenantResolutionResult> {
  if (!hostname) {
    return {
      tenantId: null,
      tenant: null,
      mode: "platform",
    };
  }

  // Verifica se é modo plataforma (app.{baseDomain})
  const platformHost = `app.${baseDomain}`;
  if (hostname === platformHost) {
    return {
      tenantId: null,
      tenant: null,
      mode: "platform",
    };
  }

  // Busca tenant pelo hostname no banco de dados
  try {
    const domain = await prisma.domain.findUnique({
      where: { hostname },
      include: { tenant: true },
    });

    if (domain?.tenant) {
      return {
        tenantId: domain.tenant.id,
        tenant: domain.tenant,
        mode: "tenant",
      };
    }

    // Se não encontrou por hostname completo, tenta por slug (subdomínio)
    if (hostname.endsWith(`.${baseDomain}`)) {
      const slug = hostname.replace(`.${baseDomain}`, "");
      if (slug) {
        const tenant = await prisma.tenant.findUnique({
          where: { slug },
        });

        if (tenant) {
          return {
            tenantId: tenant.id,
            tenant,
            mode: "tenant",
          };
        }
      }
    }

    // Não encontrou tenant
    return {
      tenantId: null,
      tenant: null,
      mode: "tenant",
    };
  } catch (error) {
    // Se a tabela não existe, retorna modo plataforma para não quebrar o app
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2021"
    ) {
      console.warn(
        "Database tables not found. Please run migrations: prisma migrate deploy"
      );
      return {
        tenantId: null,
        tenant: null,
        mode: "platform",
      };
    }

    console.error("Error resolving tenant:", error);
    return {
      tenantId: null,
      tenant: null,
      mode: "tenant",
    };
  }
}

/**
 * Valida o resultado da resolução e retorna erro se necessário
 */
export function validateTenantResolution(
  result: TenantResolutionResult
): TenantResolutionError | null {
  if (result.mode === "platform") {
    return null;
  }

  if (!result.tenantId || !result.tenant) {
    return {
      type: "NOT_FOUND",
      message: "Tenant não encontrado",
    };
  }

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

  return null;
}
