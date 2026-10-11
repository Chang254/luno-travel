import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Trip } from "@/server/models/trips.types";
import { findTripsByOwnerId } from "@/server/resources/trips.resource";

export async function getTripsForUser(
  supabase: SupabaseClient<Database>,
  ownerId: string,
): Promise<Trip[]> {
  return findTripsByOwnerId(supabase, ownerId);
}
