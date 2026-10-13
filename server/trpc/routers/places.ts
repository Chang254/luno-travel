import { protectedProcedure, router } from "@/server/trpc/trpc";
import { searchCities } from "@/server/services/places.service";
import { searchCitiesInputSchema } from "@/server/models/places.types";

export const placesRouter = router({
  searchCities: protectedProcedure.input(searchCitiesInputSchema).query(({ input }) => {
    return searchCities(input.query, input.sessionToken);
  }),
});
