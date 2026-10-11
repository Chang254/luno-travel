import { protectedProcedure, router } from "@/server/trpc/trpc";
import { getTripsForUser } from "@/server/services/trips.service";

export const tripsRouter = router({
  list: protectedProcedure.query(({ ctx }) => {
    return getTripsForUser(ctx.supabase, ctx.user.sub);
  }),
});
