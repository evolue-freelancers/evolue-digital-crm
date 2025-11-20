export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  MEMBER: "member",
} as const;

export const ROLE_NAMES = Object.values(ROLES);

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  [ROLES.SUPERADMIN]:
    "Super administrador com acesso total ao sistema e gerenciamento de tenants",
  [ROLES.ADMIN]: "Administrador com acesso completo dentro de um tenant",
  [ROLES.MEMBER]: "Membro com acesso básico dentro de um tenant",
};
