import { router } from "@/server/trpc/trpc";
import { placesRouter } from "@/server/trpc/routers/places";
import { tripsRouter } from "@/server/trpc/routers/trips";

export const appRouter = router({
  places: placesRouter,
  trips: tripsRouter,
});

export type AppRouter = typeof appRouter;
