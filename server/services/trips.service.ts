import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Trip } from "@/server/models/trips.types";
import { removeImages } from "@/server/resources/tripImages.resource";
import {
  findTripById,
  findTripsByOwnerId,
  updateTripContent,
} from "@/server/resources/trips.resource";
import { getRemovedImagePaths } from "@/server/services/tripImages.service";

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

/**
 * Saves the content, then deletes storage objects for images the save
 * dropped. Cleanup runs only after the save commits (deletes in the editor are
 * undoable until then) and its failure is logged rather than thrown: the save
 * already succeeded and a leftover object is harmless.
 */
export async function updateTripContentForUser(
  supabase: SupabaseClient<Database>,
  id: string,
  ownerId: string,
  content: Trip["content"],
): Promise<Trip> {
  const previous = await findTripById(supabase, id, ownerId);
  const trip = await updateTripContent(supabase, id, ownerId, content);

  const removedPaths = getRemovedImagePaths(previous?.content, content, ownerId, id);
  if (removedPaths.length > 0) {
    try {
      await removeImages(supabase, removedPaths);
    } catch (error) {
      console.error("Failed to remove deleted trip images", error);
    }
  }

  return trip;
}
