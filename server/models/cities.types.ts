import { z } from "zod";

import type { Tables } from "@/lib/supabase/database.types";

export const searchCitiesInputSchema = z.object({
  query: z.string().trim().min(2).max(100),
});

/** A GeoNames city from the `cities` table, without its search columns. */
export type City = Omit<Tables<"cities">, "search_name" | "search_ascii">;

/** The city fields embedded in a trip, as selected by `CITY_EMBED`. */
export type TripCityView = Pick<
  City,
  "id" | "name" | "country_code" | "region_name" | "latitude" | "longitude"
>;

export interface CitySuggestion {
  geonameId: number;
  /** e.g. "Kyoto" */
  primaryText: string;
  /** e.g. "Kyoto, Japan" */
  secondaryText: string;
  /** ISO 3166-1 alpha-2, e.g. "JP" */
  countryCode: string;
}
