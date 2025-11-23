import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";
import { rootDomain } from "./lib/utils";

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

  // Local development environment - suporta lvh.me
  if (hostname.includes(".lvh.me")) {
    const subdomain = hostname.split(".")[0];
    return subdomain || null;
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

  // Se tem subdomínio
  if (subdomain) {
    // Se está na raiz (/) e tem subdomínio, faz rewrite para /[subdomain]/
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = `/${subdomain}`;

      // Cria uma nova requisição com o pathname modificado
      const modifiedRequest = new NextRequest(url, {
        headers: request.headers,
        method: request.method,
      });

      // Processa com next-intl
      const response = intlMiddleware(modifiedRequest);

      if (response instanceof NextResponse) {
        response.headers.set("x-subdomain", subdomain);
        return response;
      }
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

      const response = intlMiddleware(modifiedRequest);

      if (response instanceof NextResponse) {
        response.headers.set("x-subdomain", subdomain);
        return response;
      }
    }
  }

  // Sem subdomínio ou já processado, processa normalmente
  const response = intlMiddleware(request);

  if (response instanceof NextResponse) {
    if (subdomain) {
      response.headers.set("x-subdomain", subdomain);
    }
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
