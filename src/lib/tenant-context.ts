import type { Tenant } from "@/generated/prisma/client";

export type TenantMode = "platform" | "tenant";

export type TenantResolutionResult = {
  tenantId: string | null;
  tenant: Tenant | null;
  mode: TenantMode;
};

export type TenantResolutionError = {
  type: "NOT_FOUND" | "SUSPENDED" | "INACTIVE";
  message: string;
};
