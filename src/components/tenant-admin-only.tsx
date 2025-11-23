"use client";

import { Can } from "@/components/can";
import { ROLES } from "@/constants/roles";

interface TenantAdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente que renderiza children apenas para admins de tenant
 * Útil para testar visibilidade em diferentes tenants
 */
export function TenantAdminOnly({
  children,
  fallback = null,
}: TenantAdminOnlyProps) {
  return (
    <Can role={ROLES.ADMIN} fallback={fallback}>
      {children}
    </Can>
  );
}
