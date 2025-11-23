import type { RoleName } from "@/constants/roles";
import { ROLES } from "@/constants/roles";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getSession() {
  return auth.api.getSession({
    headers: await import("next/headers").then((m) => m.headers()),
  });
}

/**
 * Obtém todas as roles de um usuário
 * - Se for superadmin: retorna apenas ["superadmin"]
 * - Se não for superadmin: retorna roles de todos os tenants que o usuário pertence
 */
export async function getUserRoles(userId: string): Promise<RoleName[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  // Se for superadmin, retorna apenas superadmin
  if (user?.role === ROLES.SUPERADMIN) {
    return [ROLES.SUPERADMIN];
  }

  // Caso contrário, retorna roles de todos os tenants
  const tenantMembers = await prisma.tenantMember.findMany({
    where: { userId },
    select: { role: true },
  });

  return tenantMembers.map((tm) => tm.role as RoleName);
}

/**
 * Obtém roles de um usuário em um tenant específico
 */
export async function getUserTenantRole(
  userId: string,
  tenantId: string
): Promise<RoleName | null> {
  const member = await prisma.tenantMember.findUnique({
    where: {
      tenantId_userId: {
        tenantId,
        userId,
      },
    },
    select: { role: true },
  });

  return (member?.role as RoleName) || null;
}

export async function hasRole(
  userId: string,
  role: RoleName
): Promise<boolean> {
  const userRoles = await getUserRoles(userId);
  return userRoles.includes(role);
}

/**
 * Verifica se o usuário tem uma role específica em um tenant
 */
export async function hasTenantRole(
  userId: string,
  tenantId: string,
  role: RoleName
): Promise<boolean> {
  const userRole = await getUserTenantRole(userId, tenantId);
  return userRole === role;
}

export async function hasAnyRole(
  userId: string,
  roles: RoleName[]
): Promise<boolean> {
  const userRoles = await getUserRoles(userId);
  return roles.some((role) => userRoles.includes(role));
}
