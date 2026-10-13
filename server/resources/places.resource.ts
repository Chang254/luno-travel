import type {
  GoogleAutocompleteResponse,
  GooglePlaceDetailsResponse,
} from "@/server/models/places.types";

const PLACES_API_URL = "https://places.googleapis.com/v1";

/** Server-only key; restrict it to Places API (New) in Google Cloud, with no website restriction. */
function getApiKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("GOOGLE_MAPS_API_KEY is not set");
  return key;
}

async function parseResponse<T>(response: Response, label: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${label} failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

export async function autocompleteCities(
  input: string,
  sessionToken: string,
): Promise<GoogleAutocompleteResponse> {
  const response = await fetch(`${PLACES_API_URL}/places:autocomplete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": getApiKey() },
    body: JSON.stringify({ input, sessionToken, includedPrimaryTypes: ["(cities)"] }),
  });

  return parseResponse(response, "Places autocomplete");
}

/** Ends the autocomplete session started with `sessionToken`. */
export async function fetchPlaceDetails(
  placeId: string,
  sessionToken: string,
): Promise<GooglePlaceDetailsResponse> {
  const params = new URLSearchParams({ sessionToken });
  const response = await fetch(
    `${PLACES_API_URL}/places/${encodeURIComponent(placeId)}?${params}`,
    {
      headers: {
        "X-Goog-Api-Key": getApiKey(),
        "X-Goog-FieldMask": "id,displayName,addressComponents",
      },
    },
  );

  return parseResponse(response, "Place details");
}
