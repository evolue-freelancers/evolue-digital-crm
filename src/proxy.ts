// src/proxy.ts
import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { resolveTenant, validateTenantAccess } from "@/lib/tenant-resolver";
import { rootDomain } from "@/lib/utils";

/** Extrai o subdomínio atual */
function extractSubdomain(request: NextRequest): string | null {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];
  const root = rootDomain.split(":")[0];

  // Localhost: crm.localhost:3000
  if (hostname.includes(".localhost")) {
    return hostname.split(".")[0];
  }

  // Preview Vercel: crm---main.vercel.app
  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    return hostname.split("---")[0];
  }

  // Produção: crm.meudominio.com
  const isSubdomain =
    hostname !== root &&
    hostname !== `www.${root}` &&
    hostname.endsWith(`.${root}`);

  return isSubdomain ? hostname.replace(`.${root}`, "") : null;
}

const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const subdomain = extractSubdomain(request);

  // Resolve tenant do subdomínio
  const { tenantId, tenantMode } = await resolveTenant(subdomain);

  // ---------- AUTENTICAÇÃO & PERMISSÃO ----------
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const userId = session?.user?.id ?? null;

    const allowed = await validateTenantAccess(
      tenantId,
      tenantMode,
      userId,
      pathname
    );

    if (!allowed) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch (err) {
    console.error("Erro validando tenant:", err);
  }

  // ---------- BLOQUEIA ROTAS DE ADMIN NO TENANT ----------
  if (subdomain && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // NÃO MODIFICA O PATH — mantém URLs limpas
  // ex: /login continua /login
  // ex: /dashboard continua /dashboard

  const response = intlMiddleware(request);

  // ---------- Injeta headers do tenant ----------
  if (response instanceof NextResponse) {
    response.headers.set("x-tenant-mode", tenantMode);

    if (tenantId) response.headers.set("x-tenant-id", tenantId);
    if (subdomain) response.headers.set("x-subdomain", subdomain);
  }

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
