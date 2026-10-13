import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type { City, CitySuggestion } from "@/server/models/cities.types";
import { searchCityRows } from "@/server/resources/cities.resource";

function toSuggestion({ id, name, country_code, country_name, region_name }: City): CitySuggestion {
  return {
    geonameId: id,
    primaryText: name,
    secondaryText: [region_name, country_name].filter(Boolean).join(", "),
    countryCode: country_code,
  };
}

/**
 * Best matches for a typed city name. Text after a comma narrows by region or
 * country ("portland, maine", "paris, fr"); ranking happens in `search_cities`.
 */
export async function searchCities(
  supabase: SupabaseClient<Database>,
  query: string,
): Promise<CitySuggestion[]> {
  const [name, qualifier = ""] = query.split(",").map((part) => part.trim());
  if (!name) return [];

  const cities = await searchCityRows(supabase, name, qualifier || null);
  return cities.map(toSuggestion);
}
