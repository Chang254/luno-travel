import { protectedProcedure, router } from "@/server/trpc/trpc";
import {
  createTripForUser,
  getTripForUser,
  getTripsForUser,
  updateTripContentForUser,
  updateTripCoverForUser,
} from "@/server/services/trips.service";
import { createImageUploadForUser } from "@/server/services/tripImages.service";
import {
  createTripInputSchema,
  getTripInputSchema,
  updateTripContentInputSchema,
  updateTripCoverInputSchema,
} from "@/server/models/trips.types";
import { createImageUploadInputSchema } from "@/server/models/tripImages.types";

export const tripsRouter = router({
  list: protectedProcedure.query(({ ctx }) => {
    return getTripsForUser(ctx.supabase, ctx.user.sub);
  }),

  get: protectedProcedure.input(getTripInputSchema).query(({ ctx, input }) => {
    return getTripForUser(ctx.supabase, input.id, ctx.user.sub);
  }),

  create: protectedProcedure.input(createTripInputSchema).mutation(({ ctx, input }) => {
    return createTripForUser(ctx.supabase, ctx.user.sub, input.title);
  }),

  updateCover: protectedProcedure
    .input(updateTripCoverInputSchema)
    .mutation(({ ctx, input }) => {
      return updateTripCoverForUser(ctx.supabase, input.id, ctx.user.sub, input.coverImagePath);
    }),

  updateContent: protectedProcedure
    .input(updateTripContentInputSchema)
    .mutation(({ ctx, input }) => {
      return updateTripContentForUser(ctx.supabase, input.id, ctx.user.sub, input.content);
    }),

  createImageUpload: protectedProcedure
    .input(createImageUploadInputSchema)
    .mutation(({ ctx, input }) => {
      return createImageUploadForUser(ctx.supabase, input.tripId, ctx.user.sub, input.contentType);
    }),
});
