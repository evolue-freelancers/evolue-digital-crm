export const PERMISSIONS = {
  // Tenant management (Superadmin only)
  TENANT_CREATE: "tenant:create",
  TENANT_READ: "tenant:read",
  TENANT_UPDATE: "tenant:update",
  TENANT_DELETE: "tenant:delete",

  // User management
  USER_CREATE: "user:create",
  USER_READ: "user:read",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",

  // Role management
  ROLE_CREATE: "role:create",
  ROLE_READ: "role:read",
  ROLE_UPDATE: "role:update",
  ROLE_DELETE: "role:delete",
  ROLE_ASSIGN: "role:assign",

  // Settings
  SETTINGS_READ: "settings:read",
  SETTINGS_UPDATE: "settings:update",
} as const;

export const PERMISSION_NAMES = Object.values(PERMISSIONS);

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_DESCRIPTIONS: Record<PermissionName, string> = {
  [PERMISSIONS.TENANT_CREATE]: "Criar novos tenants",
  [PERMISSIONS.TENANT_READ]: "Visualizar tenants",
  [PERMISSIONS.TENANT_UPDATE]: "Atualizar tenants",
  [PERMISSIONS.TENANT_DELETE]: "Deletar tenants",
  [PERMISSIONS.USER_CREATE]: "Criar usuários",
  [PERMISSIONS.USER_READ]: "Visualizar usuários",
  [PERMISSIONS.USER_UPDATE]: "Atualizar usuários",
  [PERMISSIONS.USER_DELETE]: "Deletar usuários",
  [PERMISSIONS.ROLE_CREATE]: "Criar roles",
  [PERMISSIONS.ROLE_READ]: "Visualizar roles",
  [PERMISSIONS.ROLE_UPDATE]: "Atualizar roles",
  [PERMISSIONS.ROLE_DELETE]: "Deletar roles",
  [PERMISSIONS.ROLE_ASSIGN]: "Atribuir roles a usuários",
  [PERMISSIONS.SETTINGS_READ]: "Visualizar configurações",
  [PERMISSIONS.SETTINGS_UPDATE]: "Atualizar configurações",
};

// Role-Permission mappings
export const ROLE_PERMISSIONS: Record<string, PermissionName[]> = {
  superadmin: [
    // Tenant management
    PERMISSIONS.TENANT_CREATE,
    PERMISSIONS.TENANT_READ,
    PERMISSIONS.TENANT_UPDATE,
    PERMISSIONS.TENANT_DELETE,
    // User management
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    // Role management
    PERMISSIONS.ROLE_CREATE,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.ROLE_UPDATE,
    PERMISSIONS.ROLE_DELETE,
    PERMISSIONS.ROLE_ASSIGN,
    // Settings
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_UPDATE,
  ],
  admin: [
    // User management (within tenant)
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    // Role management (within tenant)
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.ROLE_ASSIGN,
    // Settings (within tenant)
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_UPDATE,
  ],
  member: [
    // Basic read permissions
    PERMISSIONS.USER_READ,
    PERMISSIONS.SETTINGS_READ,
  ],
};
