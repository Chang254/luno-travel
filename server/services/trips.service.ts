import { TRPCError } from "@trpc/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Trip } from "@/server/models/trips.types";
import { removeImages } from "@/server/resources/tripImages.resource";
import {
  findTripById,
  findTripsByOwnerId,
  insertTrip,
  updateTripContent,
  updateTripCover,
} from "@/server/resources/trips.resource";
import { getRemovedImagePaths, getTripImageFolder } from "@/server/services/tripImages.service";

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

export async function createTripForUser(
  supabase: SupabaseClient<Database>,
  ownerId: string,
  title: string,
): Promise<Trip> {
  return insertTrip(supabase, ownerId, title);
}

/**
 * Sets the cover to an uploaded object path. The path must sit in this trip's
 * image folder so a client can't point the cover at another user's object.
 */
export async function updateTripCoverForUser(
  supabase: SupabaseClient<Database>,
  id: string,
  ownerId: string,
  coverImagePath: string,
): Promise<Trip> {
  const folder = getTripImageFolder(ownerId, id);
  if (!coverImagePath.startsWith(folder) || coverImagePath.includes("..")) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid cover image path" });
  }

  return updateTripCover(supabase, id, ownerId, coverImagePath);
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
