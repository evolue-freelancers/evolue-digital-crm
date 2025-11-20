import type { PermissionName } from "@/constants/permissions";
import { ROLE_PERMISSIONS } from "@/constants/permissions";
import type { RoleName } from "@/constants/roles";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getSession() {
  return auth.api.getSession({
    headers: await import("next/headers").then((m) => m.headers()),
  });
}

export async function getUserRoles(userId: string): Promise<RoleName[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });

  return userRoles.map((ur) => ur.role.name as RoleName);
}

export async function getUserPermissions(
  userId: string
): Promise<PermissionName[]> {
  const userRoles = await getUserRoles(userId);

  const permissions = new Set<PermissionName>();

  for (const role of userRoles) {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    rolePermissions.forEach((permission) => permissions.add(permission));
  }

  return Array.from(permissions);
}

export async function hasRole(
  userId: string,
  role: RoleName
): Promise<boolean> {
  const userRoles = await getUserRoles(userId);
  return userRoles.includes(role);
}

export async function hasPermission(
  userId: string,
  permission: PermissionName
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);
  return userPermissions.includes(permission);
}

export async function hasAnyRole(
  userId: string,
  roles: RoleName[]
): Promise<boolean> {
  const userRoles = await getUserRoles(userId);
  return roles.some((role) => userRoles.includes(role));
}

export async function hasAnyPermission(
  userId: string,
  permissions: PermissionName[]
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);
  return permissions.some((permission) => userPermissions.includes(permission));
}
