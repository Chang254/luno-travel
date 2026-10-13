import { protectedProcedure, router } from "@/server/trpc/trpc";
import { searchCities } from "@/server/services/cities.service";
import { searchCitiesInputSchema } from "@/server/models/cities.types";

export const citiesRouter = router({
  search: protectedProcedure.input(searchCitiesInputSchema).query(({ ctx, input }) => {
    return searchCities(ctx.supabase, input.query);
  }),
});
