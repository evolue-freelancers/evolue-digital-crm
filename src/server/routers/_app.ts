// import { inferRouterOutputs } from "@trpc/server"

import { router } from "@/server/trpc/init";

export const appRouter = router({});

export type AppRouter = typeof appRouter;

//type RouterOutputs = inferRouterOutputs<AppRouter>

// export type User = RouterOutputs["users"]["list"]["users"][number]
