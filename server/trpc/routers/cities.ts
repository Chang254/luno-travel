import { protectedProcedure, router } from "@/server/trpc/trpc";
import { searchCities } from "@/server/services/cities.service";
import { searchCitiesInputSchema } from "@/server/models/cities.types";

export const citiesRouter = router({
  search: protectedProcedure.input(searchCitiesInputSchema).query(({ input }) => {
    return searchCities(input.query);
  }),
});
