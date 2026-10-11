import { router } from "@/server/trpc/trpc";
import { tripsRouter } from "@/server/trpc/routers/trips";

export const appRouter = router({
  trips: tripsRouter,
});

export type AppRouter = typeof appRouter;
