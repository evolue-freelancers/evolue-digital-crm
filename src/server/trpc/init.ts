import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { prisma } from "@/lib/prisma";

export type Context = {
  prisma: typeof prisma;
  userId?: string | null;
  headers: Headers;
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,

  errorFormatter: ({ shape, error }) => {
    const zodError =
      error.code === "BAD_REQUEST" && error.cause instanceof ZodError
        ? error.cause.flatten((issue) => issue.message)
        : null;

    return {
      ...shape,
      zodError,
    };
  },
});

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, userId: ctx.userId! } });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
