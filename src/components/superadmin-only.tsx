"use client";

import { Can } from "@/components/can";
import { ROLES } from "@/constants/roles";

interface SuperAdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente que renderiza children apenas para superadmins
 * Útil para testar visibilidade em diferentes tenants
 */
export function SuperAdminOnly({
  children,
  fallback = null,
}: SuperAdminOnlyProps) {
  return (
    <Can role={ROLES.SUPERADMIN} fallback={fallback}>
      {children}
    </Can>
  );
}
