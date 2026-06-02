import { createTRPCRouter } from "@/trpc/init";
import { aileneRouter } from "./ailene/_router.ailene";
import { authRouter } from "./auth";

export const appRouter = createTRPCRouter({
  ailene: aileneRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
