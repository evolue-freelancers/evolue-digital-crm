// src/proxy.ts
import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { resolveTenant, validateTenantAccess } from "@/lib/tenant-resolver";
import { rootDomain } from "@/lib/utils";

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // Ambiente de desenvolvimento local
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    // Tenta extrair subdomínio da URL completa (ex: http://crm.localhost:3000)
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    // Fallback: host header (ex: crm.localhost:3000)
    if (hostname.includes(".localhost")) {
      return hostname.split(".")[0];
    }

    return null;
  }

  // Produção
  const rootDomainFormatted = rootDomain.split(":")[0];

  // URLs de preview da Vercel: tenant---branch-name.vercel.app
  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    const parts = hostname.split("---");
    return parts.length > 0 ? parts[0] : null;
  }

  // Subdomínio normal: crm.claudiolibanez.com.br
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, "") : null;
}

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Constrói o pathname interno para tenants.
 *
 * Externo (usuário):   /login
 * Subdomínio "crm":    /crm/login
 * Isso casa com app/[locale]/[domain]/...
 */
function buildTenantPathname(pathname: string, subdomain: string): string {
  const cleanPath = pathname === "/" ? "" : pathname; // "/" -> ""
  return `/${subdomain}${cleanPath}`;
}

export default async function proxy(request: NextRequest) {
  const originalUrl = request.nextUrl.clone();
  const originalPathname = originalUrl.pathname; // ex: "/", "/login", "/dashboard"
  const subdomain = extractSubdomain(request);

  // Resolve o tenant baseado no subdomínio
  const { tenantId, tenantMode } = await resolveTenant(subdomain);

  // Valida acesso do usuário ao tenant para rotas protegidas
  try {
    const session = await auth.api
      .getSession({
        headers: request.headers,
      })
      .catch(() => null);

    const userId = session?.user?.id ?? null;
    const hasAccess = await validateTenantAccess(
      tenantId,
      tenantMode,
      userId,
      originalPathname
    );

    if (!hasAccess) {
      // Usuário não tem acesso ao tenant, redireciona para login
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  } catch (error) {
    // Em caso de erro, permite continuar (será validado no layout protegido)
    console.error("Erro ao validar acesso ao tenant:", error);
  }

  // Se tem subdomínio, bloqueia acesso à página admin a partir de subdomínios
  if (subdomain && originalPathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Clona a URL para poder reescrever internamente
  const url = request.nextUrl.clone();

  // Request que vamos mandar pro next-intl
  let modifiedRequest: NextRequest;

  if (subdomain) {
    // 🔥 Caso TENANT: reescreve internamente o pathname para incluir o [domain]
    // Ex: /login -> /crm/login
    url.pathname = buildTenantPathname(originalPathname, subdomain);

    modifiedRequest = new NextRequest(url, {
      headers: request.headers,
      method: request.method,
    });
  } else {
    // Caso plataforma (sem subdomínio): mantém o pathname original
    modifiedRequest = new NextRequest(url, {
      headers: request.headers,
      method: request.method,
    });
  }

  // Define headers para o contexto do tRPC / tenant
  modifiedRequest.headers.set("x-tenant-mode", tenantMode);
  if (tenantId) {
    modifiedRequest.headers.set("x-tenant-id", tenantId);
  }
  if (subdomain) {
    modifiedRequest.headers.set("x-subdomain", subdomain);
  }

  // Delega para o next-intl (que vai cuidar do [locale])
  const response = intlMiddleware(modifiedRequest);

  if (response instanceof NextResponse) {
    response.headers.set("x-tenant-mode", tenantMode);
    if (tenantId) {
      response.headers.set("x-tenant-id", tenantId);
    }
    if (subdomain) {
      response.headers.set("x-subdomain", subdomain);
    }
    return response;
  }

  return response;
}

export const config = {
  // Match all pathnames exceto:
  // - se começam com `/api`, `/trpc`, `/_next` ou `/_vercel`
  // - ou se contêm um ponto (ex: `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
