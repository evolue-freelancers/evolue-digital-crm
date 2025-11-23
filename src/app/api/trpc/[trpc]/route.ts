import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc/context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,

    createContext: async ({ req }) =>
      await createTRPCContext({ headers: req.headers }),

    onError: ({ error, path }) => {
      if (process.env.NODE_ENV !== "production") {
        console.error(`❌ tRPC ${path} - ${error.message}`);
      }
    },
  });

export { handler as GET, handler as POST };
