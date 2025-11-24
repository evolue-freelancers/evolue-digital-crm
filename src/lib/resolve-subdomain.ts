import { headers } from "next/headers";

export async function resolveSubdomain(): Promise<string | null> {
  const h = await headers();
  const host = h.get("host");

  if (!host) return null;

  const hostname = host.split(":")[0];

  // Pegue o ROOT DOMAIN a partir do env
  const root =
    process.env.NEXT_PUBLIC_ROOT_DOMAIN?.split(":")[0] || "localhost";

  // --------- LOCALHOST ----------
  // crm.localhost:3000
  if (hostname.includes(".localhost")) {
    return hostname.replace(".localhost", "");
  }

  // --------- VERCEL PREVIEW ----------
  // crm---main.vercel.app
  if (hostname.includes("---") && hostname.endsWith(".vercel.app")) {
    return hostname.split("---")[0];
  }

  // --------- PRODUÇÃO ----------
  // crm.meudominio.com
  const isSub =
    hostname !== root &&
    hostname !== `www.${root}` &&
    hostname.endsWith(`.${root}`);

  if (isSub) {
    return hostname.replace(`.${root}`, "");
  }

  // Sem subdomínio
  return null;
}
