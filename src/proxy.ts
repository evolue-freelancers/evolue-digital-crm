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

  // Local development environment
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    // Fallback to host header approach
    if (hostname.includes(".localhost")) {
      return hostname.split(".")[0];
    }

    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(":")[0];

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    const parts = hostname.split("---");
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, "") : null;
}

const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  // Resolve o tenant baseado no subdomain
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
      pathname
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

  // Se tem subdomínio
  if (subdomain) {
    // Bloqueia acesso à página admin a partir de subdomínios
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Se já está na rota do subdomínio ou em outra rota, processa normalmente
    // mas garante que o subdomínio está no pathname se necessário
    if (!pathname.startsWith(`/${subdomain}`)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${subdomain}${pathname}`;

      const modifiedRequest = new NextRequest(url, {
        headers: request.headers,
        method: request.method,
      });

      // Define headers para o contexto do tRPC
      modifiedRequest.headers.set("x-subdomain", subdomain);
      if (tenantId) {
        modifiedRequest.headers.set("x-tenant-id", tenantId);
      }
      modifiedRequest.headers.set("x-tenant-mode", tenantMode);

      const response = intlMiddleware(modifiedRequest);

      if (response instanceof NextResponse) {
        response.headers.set("x-subdomain", subdomain);
        if (tenantId) {
          response.headers.set("x-tenant-id", tenantId);
        }
        response.headers.set("x-tenant-mode", tenantMode);
        return response;
      }
    }
  }

  // Sem subdomínio ou já processado, processa normalmente
  const modifiedRequest = new NextRequest(request.url, {
    headers: request.headers,
    method: request.method,
  });

  modifiedRequest.headers.set("x-tenant-mode", tenantMode);
  if (tenantId) {
    modifiedRequest.headers.set("x-tenant-id", tenantId);
  }
  if (subdomain) {
    modifiedRequest.headers.set("x-subdomain", subdomain);
  }

  const response = intlMiddleware(modifiedRequest);

  if (response instanceof NextResponse) {
    if (subdomain) {
      response.headers.set("x-subdomain", subdomain);
    }
    if (tenantId) {
      response.headers.set("x-tenant-id", tenantId);
    }
    response.headers.set("x-tenant-mode", tenantMode);
    return response;
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
