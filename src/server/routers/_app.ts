import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { router } from "@/server/trpc/init";

import { authRouter } from "./auth";
import { platformRouter } from "./platform";
import { tenantRouter } from "./tenant";
import { userRouter } from "./user";

export const appRouter = router({
  auth: authRouter,
  tenant: tenantRouter,
  platform: platformRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;

// Tipos inferidos dos routers
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;

// Tipos específicos de cada router
export type AuthOutputs = RouterOutputs["auth"];
export type TenantOutputs = RouterOutputs["tenant"];
export type PlatformOutputs = RouterOutputs["platform"];

// Tipos de entidades comuns
// Nota: User type removido pois register foi removido
// Use o tipo User diretamente do Prisma quando necessário
export type Tenant = RouterOutputs["tenant"]["get"];
export type TenantUpdate = RouterOutputs["tenant"]["update"];
export type TenantWithCounts =
  RouterOutputs["platform"]["tenants"]["list"][number];
export type TenantWithRelations = RouterOutputs["platform"]["tenants"]["get"];
export type Domain = RouterOutputs["platform"]["domains"]["list"][number];
export type DomainCreate = RouterOutputs["platform"]["domains"]["add"];
export type TenantMember = RouterOutputs["platform"]["members"]["list"][number];
export type TenantMemberCreate = RouterOutputs["platform"]["members"]["add"];
export type TenantMemberUpdate = RouterOutputs["platform"]["members"]["update"];
export type Session = RouterOutputs["auth"]["login"]["session"];

// Tipos de inputs
export type AuthInputs = RouterInputs["auth"];
export type TenantInputs = RouterInputs["tenant"];
export type PlatformInputs = RouterInputs["platform"];
