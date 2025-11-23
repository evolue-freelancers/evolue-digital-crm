import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";
import {
  getBaseDomain,
  normalizeHost,
  resolveTenantId,
  validateTenantResolution,
} from "./lib/tenant-resolver";

const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const headers = request.headers;
  const hostname = normalizeHost(headers);
  const baseDomain = getBaseDomain();

  // Resolve tenant pelo hostname (subdomínio ou domínio personalizado)
  const tenantResult = await resolveTenantId(hostname, baseDomain);

  // Validate tenant resolution
  const error = validateTenantResolution(tenantResult);

  // Handle errors
  if (error) {
    const url = request.nextUrl.clone();

    if (error.type === "SUSPENDED") {
      url.pathname = "/suspended";
      return NextResponse.redirect(url);
    }

    if (error.type === "INACTIVE" || error.type === "NOT_FOUND") {
      // Only redirect to not-found if we're in tenant mode
      if (tenantResult.mode === "tenant") {
        url.pathname = "/not-found";
        return NextResponse.redirect(url);
      }
    }
  }

  // Add tenant headers for downstream use
  const response = intlMiddleware(request);

  if (response instanceof NextResponse) {
    // Add tenant context headers
    if (tenantResult.tenantId) {
      response.headers.set("x-tenant-id", tenantResult.tenantId);
    }
    response.headers.set("x-tenant-mode", tenantResult.mode);

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
