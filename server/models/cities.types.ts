import { z } from "zod";

export const searchCitiesInputSchema = z.object({
  query: z.string().trim().min(2).max(100),
});

export interface CitySuggestion {
  geonameId: number;
  /** e.g. "Kyoto" */
  primaryText: string;
  /** e.g. "Kyoto, Japan" */
  secondaryText: string;
  /** ISO 3166-1 alpha-2, e.g. "JP" */
  countryCode: string;
}

export interface CityDetails {
  name: string;
  /** ISO 3166-1 alpha-2, e.g. "JP" */
  countryCode: string;
  latitude: number;
  longitude: number;
}

/**
 * One row of `server/data/cities.json`, built from GeoNames by
 * `npm run cities:build` and sorted by population, largest first.
 */
export type GeoNamesCity = [
  geonameId: number,
  name: string,
  /** Empty when the same as `name`. */
  asciiName: string,
  countryCode: string,
  /** State, prefecture, etc.; empty when unknown. */
  regionName: string,
  latitude: number,
  longitude: number,
  population: number,
];
