import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Trip } from "@/server/models/trips.types";
import {
  findTripById,
  findTripsByOwnerId,
  updateTripContent,
} from "@/server/resources/trips.resource";

export async function getTripsForUser(
  supabase: SupabaseClient<Database>,
  ownerId: string,
): Promise<Trip[]> {
  return findTripsByOwnerId(supabase, ownerId);
}

export async function getTripForUser(
  supabase: SupabaseClient<Database>,
  id: string,
  ownerId: string,
): Promise<Trip | null> {
  return findTripById(supabase, id, ownerId);
}

export async function updateTripContentForUser(
  supabase: SupabaseClient<Database>,
  id: string,
  ownerId: string,
  content: Trip["content"],
): Promise<Trip> {
  return updateTripContent(supabase, id, ownerId, content);
}
