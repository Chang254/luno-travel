import { TRPCError } from "@trpc/server";

import type { CityDetails, CitySuggestion } from "@/server/models/places.types";
import { autocompleteCities, fetchPlaceDetails } from "@/server/resources/places.resource";

export async function searchCities(query: string, sessionToken: string): Promise<CitySuggestion[]> {
  const { suggestions = [] } = await autocompleteCities(query, sessionToken);

  return suggestions.flatMap(({ placePrediction }) => {
    if (!placePrediction) return [];
    const { placeId, text, structuredFormat } = placePrediction;
    return {
      placeId,
      primaryText: structuredFormat?.mainText.text ?? text.text,
      secondaryText: structuredFormat?.secondaryText?.text ?? "",
    };
  });
}

/**
 * Resolves a picked suggestion server-side so the stored name and country code
 * come from Google, not the client.
 */
export async function getCityDetails(placeId: string, sessionToken: string): Promise<CityDetails> {
  const place = await fetchPlaceDetails(placeId, sessionToken);
  const country = place.addressComponents?.find(({ types }) => types.includes("country"));
  const name = place.displayName?.text;

  if (!country || !name) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Place is not a city in a country" });
  }

  return { placeId: place.id, name, countryCode: country.shortText.toUpperCase() };
}
