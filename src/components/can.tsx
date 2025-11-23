"use client";

import { ReactNode } from "react";

import { ROLES } from "@/constants/roles";
import { useCan } from "@/hooks/use-can";

type RoleName = (typeof ROLES)[keyof typeof ROLES];

interface CanProps {
  role: RoleName;
  children: ReactNode;
  fallback?: ReactNode;
  showLoading?: boolean;
  loadingComponent?: ReactNode;
}

/**
 * Componente que renderiza children apenas se o usuário tiver a role especificada
 */
export function Can({
  role,
  children,
  fallback = null,
  showLoading = false,
  loadingComponent = null,
}: CanProps) {
  const { can, isLoading } = useCan({ role });

  if (isLoading && showLoading) {
    return <>{loadingComponent}</>;
  }

  if (!can) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
