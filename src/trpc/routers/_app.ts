import { createTRPCRouter } from "@/trpc/init";
import { authRouter } from "./auth";
import { createRouter } from "./create";
import { listRouter } from "./list";
import { readRouter } from "./read";
import { updateRouter } from "./update";

export const appRouter = createTRPCRouter({
  create: createRouter,
  read: readRouter,
  update: updateRouter,
  list: listRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
