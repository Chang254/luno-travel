import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";
import type { CitySuggestion } from "@/server/models/cities.types";
import { searchCityRows } from "@/server/resources/cities";
import { toSuggestion } from "./cities.helpers";

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
