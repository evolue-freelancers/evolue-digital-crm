"use client";

import { ROLES } from "@/constants/roles";
import { trpc } from "@/trpc/client";

type RoleName = (typeof ROLES)[keyof typeof ROLES];

interface UseCanOptions {
  role: RoleName;
  fallback?: boolean;
}

/**
 * Hook para verificar se o usuário atual tem permissão para executar uma ação
 * baseado na sua role atual (superadmin, admin ou member)
 */
export function useCan({ role, fallback = false }: UseCanOptions) {
  const { data: hasRole, isLoading } = trpc.user.hasRole.useQuery(
    { role },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  return {
    can: hasRole ?? fallback,
    isLoading,
  };
}

/**
 * Hook para obter a role atual do usuário
 */
export function useCurrentRole() {
  const { data: role, isLoading } = trpc.user.getCurrentRole.useQuery(
    undefined,
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  return {
    role: role ?? null,
    isLoading,
  };
}
