import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { PublishedTrip } from "@/server/models/publishedTrips.types";

/** No owner filter: RLS lets anyone read published trips. */
export async function findPublishedTripById(
  supabase: SupabaseClient<Database>,
  tripId: string,
): Promise<PublishedTrip | null> {
  const { data, error } = await supabase
    .from("published_trips")
    .select("*")
    .eq("trip_id", tripId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertPublishedTrip(
  supabase: SupabaseClient<Database>,
  snapshot: Omit<PublishedTrip, "published_at">,
): Promise<PublishedTrip> {
  const { data, error } = await supabase
    .from("published_trips")
    .upsert({ ...snapshot, published_at: new Date().toISOString() }, { onConflict: "trip_id" })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deletePublishedTrip(
  supabase: SupabaseClient<Database>,
  tripId: string,
  ownerId: string,
): Promise<void> {
  const { error } = await supabase
    .from("published_trips")
    .delete()
    .eq("trip_id", tripId)
    .eq("owner_id", ownerId);

  if (error) throw error;
}
