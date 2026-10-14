import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { City } from "@/server/models/cities.types";

/** Embeds a row's city in a `trips` or `published_trips` select. */
export const CITY_EMBED = "city:cities(id, name, country_code, region_name, latitude, longitude)";

/** Ranked matches from the `search_cities` database function. */
export async function searchCityRows(
  supabase: SupabaseClient<Database>,
  query: string,
  qualifier: string | null,
): Promise<City[]> {
  const { data, error } = await supabase.rpc("search_cities", {
    query,
    ...(qualifier && { qualifier }),
  });

  if (error) throw error;
  return data;
}
