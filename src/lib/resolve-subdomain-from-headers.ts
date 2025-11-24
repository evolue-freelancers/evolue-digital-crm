// src/lib/resolve-subdomain.ts
import { headers } from "next/headers";

/**
 * Resolve o subdomínio atual com base no header "host".
 *
 * Funciona em:
 * - Localhost com subdomínio: crm.localhost:3000
 * - Vercel preview: crm---main.vercel.app
 * - Produção com domínio customizado: crm.claudiolibanez.com.br
 *
 * IMPORTANTE:
 * - Configure NEXT_PUBLIC_ROOT_DOMAIN em produção como, por ex: "claudiolibanez.com.br"
 *   (SEM "crm." na frente, SEM porta)
 */
export async function resolveSubdomainFromHeaders(): Promise<string | null> {
  const h = await headers();
  const host = h.get("host");
  if (!host) return null;

  const hostname = host.split(":")[0];

  // 1) Dev puro sem subdomínio: localhost:3000
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return null;
  }

  // 2) Dev com subdomínio: crm.localhost:3000
  if (hostname.endsWith(".localhost")) {
    // "crm.localhost" -> "crm"
    return hostname.replace(".localhost", "");
  }

  // 3) Vercel preview: crm---main.vercel.app
  if (hostname.endsWith(".vercel.app")) {
    // Ex: "crm---main.vercel.app"
    const [maybeSub] = hostname.split("---");
    // Se tiver "---", é subdomínio de preview
    if (hostname.includes("---")) {
      return maybeSub || null;
    }
    // Se for só "meuapp.vercel.app" (sem subdomínio de cliente), não considera subdomínio
    return null;
  }

  // 4) Produção com domínio customizado
  //    Ex: crm.claudiolibanez.com.br
  //    Configure NEXT_PUBLIC_ROOT_DOMAIN="claudiolibanez.com.br"
  const rootEnv = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  if (rootEnv) {
    const root = rootEnv.split(":")[0];

    if (hostname === root || hostname === `www.${root}`) {
      return null;
    }

    if (hostname.endsWith(`.${root}`)) {
      // "crm.claudiolibanez.com.br".replace(".claudiolibanez.com.br", "") -> "crm"
      return hostname.replace(`.${root}`, "");
    }

    // Host não bate com rootDomain: trata como sem subdomínio
    return null;
  }

  // 5) Fallback genérico (sem NEXT_PUBLIC_ROOT_DOMAIN configurado)
  //    Ex: crm.minhaapp.com
  const parts = hostname.split(".");
  if (parts.length <= 2) {
    return null; // tipo "minhaapp.com"
  }

  // Pega só a primeira parte como subdomínio (crm.minhaapp.com -> "crm")
  return parts[0] || null;
}
