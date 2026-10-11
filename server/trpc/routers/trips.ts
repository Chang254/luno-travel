import { protectedProcedure, router } from "@/server/trpc/trpc";
import {
  getTripForUser,
  getTripsForUser,
  updateTripContentForUser,
} from "@/server/services/trips.service";
import {
  getTripInputSchema,
  updateTripContentInputSchema,
} from "@/server/models/trips.types";

export const tripsRouter = router({
  list: protectedProcedure.query(({ ctx }) => {
    return getTripsForUser(ctx.supabase, ctx.user.sub);
  }),

  get: protectedProcedure.input(getTripInputSchema).query(({ ctx, input }) => {
    return getTripForUser(ctx.supabase, input.id, ctx.user.sub);
  }),

  updateContent: protectedProcedure
    .input(updateTripContentInputSchema)
    .mutation(({ ctx, input }) => {
      return updateTripContentForUser(ctx.supabase, input.id, ctx.user.sub, input.content);
    }),
});
