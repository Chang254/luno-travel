import { getUserProfile } from "@/lib/auth/userProfile";
import { protectedProcedure, publicProcedure, router } from "@/server/trpc/trpc";
import {
  createTripForUser,
  getPublicationForUser,
  getPublishedTrip,
  getTripForUser,
  getTripsForUser,
  publishTripForUser,
  unpublishTripForUser,
  updateTripCityForUser,
  updateTripContentForUser,
  updateTripCoverForUser,
} from "@/server/services/trips.service";
import { createImageUploadForUser } from "@/server/services/tripImages.service";
import {
  createTripInputSchema,
  getTripInputSchema,
  updateTripCityInputSchema,
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
    return createTripForUser(ctx.supabase, ctx.user.sub, input.title, input.city);
  }),

  updateCover: protectedProcedure
    .input(updateTripCoverInputSchema)
    .mutation(({ ctx, input }) => {
      return updateTripCoverForUser(ctx.supabase, input.id, ctx.user.sub, input.coverImagePath);
    }),

  updateCity: protectedProcedure.input(updateTripCityInputSchema).mutation(({ ctx, input }) => {
    return updateTripCityForUser(ctx.supabase, input.id, ctx.user.sub, input.city);
  }),

  updateContent: protectedProcedure
    .input(updateTripContentInputSchema)
    .mutation(({ ctx, input }) => {
      return updateTripContentForUser(ctx.supabase, input.id, ctx.user.sub, input.content);
    }),

  getPublication: protectedProcedure.input(getTripInputSchema).query(({ ctx, input }) => {
    return getPublicationForUser(ctx.supabase, input.id, ctx.user.sub);
  }),

  getPublished: publicProcedure.input(getTripInputSchema).query(({ ctx, input }) => {
    return getPublishedTrip(ctx.supabase, input.id);
  }),

  publish: protectedProcedure.input(getTripInputSchema).mutation(({ ctx, input }) => {
    return publishTripForUser(ctx.supabase, input.id, ctx.user.sub, getUserProfile(ctx.user));
  }),

  unpublish: protectedProcedure.input(getTripInputSchema).mutation(({ ctx, input }) => {
    return unpublishTripForUser(ctx.supabase, input.id, ctx.user.sub);
  }),

  createImageUpload: protectedProcedure
    .input(createImageUploadInputSchema)
    .mutation(({ ctx, input }) => {
      return createImageUploadForUser(ctx.supabase, input.tripId, ctx.user.sub, input.contentType);
    }),
});
