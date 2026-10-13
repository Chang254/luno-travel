import { router } from "@/server/trpc/trpc";
import { citiesRouter } from "@/server/trpc/routers/cities";
import { tripsRouter } from "@/server/trpc/routers/trips";

export const appRouter = router({
  cities: citiesRouter,
  trips: tripsRouter,
});

export type AppRouter = typeof appRouter;
