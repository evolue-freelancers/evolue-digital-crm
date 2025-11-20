import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import type { Context } from "./init";

export async function createTRPCContext({
  headers,
}: {
  headers: Headers;
}): Promise<Context> {
  const session = await auth.api.getSession({ headers }).catch(() => null);

  const userId = session?.user?.id ?? null;

  return {
    prisma,
    userId,
    headers,
  };
}
