import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const rootDomain =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
export const rootDomainDescription =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN_DESCRIPTION || "Evolue Digital CRM";
export const adminSubdomain = process.env.NEXT_PUBLIC_ADMIN_SUBDOMAIN || "app";

/**
 * Retorna o domínio base sem porta
 */
export function getBaseDomain(): string {
  return rootDomain.split(":")[0];
}

/**
 * Função utilitária para combinar classes CSS com Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
