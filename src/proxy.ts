import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

function extractSubdomain(request: NextRequest): string | null {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // Local development environment - suporta lvh.me e localhost
  if (hostname.includes(".lvh.me")) {
    const subdomain = hostname.split(".")[0];
    return subdomain || null;
  }

  // Local development environment
  if (hostname.includes(".localhost")) {
    const subdomain = hostname.split(".")[0];
    return subdomain || null;
  }

  return null;
}

const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);

  // Se tem subdomínio e a rota [subdomain] existe, faz rewrite
  if (subdomain && !pathname.startsWith(`/${subdomain}`)) {
    const url = request.nextUrl.clone();
    // Rewrite para incluir o subdomínio no pathname
    // Se pathname é "/", vira "/app", se é "/home", vira "/app/home"
    url.pathname = `/${subdomain}${pathname === "/" ? "" : pathname}`;

    // Cria uma nova requisição com o pathname modificado para o middleware processar
    const modifiedRequest = new NextRequest(url, {
      headers: request.headers,
      method: request.method,
    });

    // Processa com next-intl
    const response = intlMiddleware(modifiedRequest);

    if (response instanceof NextResponse) {
      // Add subdomain header
      response.headers.set("x-subdomain", subdomain);
      return response;
    }
  }

  // Sem subdomínio, processa normalmente
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
