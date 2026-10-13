import { z } from "zod";

/**
 * Google bills autocomplete keystrokes plus the final Place Details call as one
 * session when they share this token. The client mints one per picker session.
 */
export const placesSessionTokenSchema = z.uuid();

export const searchCitiesInputSchema = z.object({
  query: z.string().trim().min(2).max(100),
  sessionToken: placesSessionTokenSchema,
});

export interface CitySuggestion {
  placeId: string;
  /** e.g. "Kyoto" */
  primaryText: string;
  /** e.g. "Kyoto, Japan" */
  secondaryText: string;
}

export interface CityDetails {
  placeId: string;
  name: string;
  /** ISO 3166-1 alpha-2, e.g. "JP" */
  countryCode: string;
}

/** Subset of `places:autocomplete` (Places API New) that we read. */
export interface GoogleAutocompleteResponse {
  suggestions?: {
    placePrediction?: {
      placeId: string;
      text: { text: string };
      structuredFormat?: {
        mainText: { text: string };
        secondaryText?: { text: string };
      };
    };
  }[];
}

/** Subset of a Place Details (Places API New) response for our field mask. */
export interface GooglePlaceDetailsResponse {
  id: string;
  displayName?: { text: string };
  addressComponents?: { longText: string; shortText: string; types: string[] }[];
}
