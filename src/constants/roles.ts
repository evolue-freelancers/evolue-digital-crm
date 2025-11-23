/**
 * Roles do sistema
 *
 * Estrutura de Multi-tenancy:
 * - SUPERADMIN: Role de plataforma, sem tenant associado
 *   - Acesso ao painel app.{domain}
 *   - Pode gerenciar todos os tenants
 *   - Não pertence a nenhum tenant específico
 *
 * - ADMIN: Role dentro de um tenant (TENANT_ADMIN)
 *   - Acesso completo dentro do tenant
 *   - Pode gerenciar membros e configurações do tenant
 *   - Pertence a um tenant específico via TenantMember
 *
 * - MEMBER: Role dentro de um tenant (TENANT_MEMBER)
 *   - Acesso básico dentro do tenant
 *   - Permissões limitadas
 *   - Pertence a um tenant específico via TenantMember
 */
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

/**
 * Roles de plataforma (sem tenant)
 * Acessíveis apenas em app.{domain}
 */
export const PLATFORM_ROLES = [ROLES.SUPERADMIN] as const;

/**
 * Roles de tenant
 * Acessíveis apenas dentro de um tenant específico
 */
export const TENANT_ROLES = [ROLES.ADMIN, ROLES.MEMBER] as const;

/**
 * Verifica se uma role é de plataforma
 */
export function isPlatformRole(role: string): boolean {
  return PLATFORM_ROLES.includes(role as (typeof PLATFORM_ROLES)[number]);
}

/**
 * Verifica se uma role é de tenant
 */
export function isTenantRole(role: string): boolean {
  return TENANT_ROLES.includes(role as (typeof TENANT_ROLES)[number]);
}
