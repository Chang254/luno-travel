import { TRPCError } from "@trpc/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { UserProfile } from "@/lib/auth/userProfile";
import type { PublishedTrip } from "@/server/models/publishedTrips.types";
import type {
  Trip,
  TripCity,
  TripCityInput,
  UpdateTripDetailsInput,
} from "@/server/models/trips.types";
import {
  deletePublishedTrip,
  findPublishedTripById,
  upsertPublishedTrip,
} from "@/server/resources/publishedTrips.resource";
import { removeImages } from "@/server/resources/tripImages.resource";
import {
  findTripById,
  findTripsByOwnerId,
  insertTrip,
  updateTripContent,
  updateTripDetails,
  updateTripCover,
} from "@/server/resources/trips.resource";
import { getCityDetails } from "@/server/services/places.service";
import {
  getRemovedCoverPaths,
  getRemovedImagePaths,
  getTripImageFolder,
} from "@/server/services/tripImages.service";

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

/** Looks the picked place up with Google so the stored name and country can't be forged. */
async function resolveTripCity(city: TripCityInput): Promise<TripCity> {
  const details = await getCityDetails(city.placeId, city.sessionToken);
  return {
    city_place_id: details.placeId,
    city_name: details.name,
    city_country_code: details.countryCode,
  };
}

export async function createTripForUser(
  supabase: SupabaseClient<Database>,
  ownerId: string,
  title: string,
  city: TripCityInput,
): Promise<Trip> {
  return insertTrip(supabase, ownerId, title, await resolveTripCity(city));
}

/** Covers must sit in this trip's image folder so a client can't point one at another user's object. */
function assertTripImagePath(ownerId: string, id: string, path: string) {
  const folder = getTripImageFolder(ownerId, id);
  if (!path.startsWith(folder) || path.includes("..")) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid cover image path" });
  }
}

/** Sets the cover to an uploaded object path. */
export async function updateTripCoverForUser(
  supabase: SupabaseClient<Database>,
  id: string,
  ownerId: string,
  coverImagePath: string,
): Promise<Trip> {
  assertTripImagePath(ownerId, id, coverImagePath);
  return updateTripCover(supabase, id, ownerId, coverImagePath);
}

/**
 * Saves the title, plus the place and cover when they changed. A replaced or
 * removed cover is then deleted from storage, unless the published snapshot
 * still shows it.
 */
export async function updateTripDetailsForUser(
  supabase: SupabaseClient<Database>,
  id: string,
  ownerId: string,
  { title, city, coverImagePath }: UpdateTripDetailsInput,
): Promise<Trip> {
  if (coverImagePath) assertTripImagePath(ownerId, id, coverImagePath);

  const resolvedCity = city && (await resolveTripCity(city));
  const previous = await findTripById(supabase, id, ownerId);
  const trip = await updateTripDetails(supabase, id, ownerId, {
    title,
    ...resolvedCity,
    ...(coverImagePath !== undefined && { cover_image_url: coverImagePath }),
  });

  if (previous?.cover_image_url && previous.cover_image_url !== trip.cover_image_url) {
    const published = await findPublishedTripById(supabase, id);
    await removeUnreferencedImages(
      supabase,
      getRemovedCoverPaths(previous.cover_image_url, ownerId, id, [published?.cover_image_url]),
    );
  }

  return trip;
}

/**
 * Deletes storage objects no longer referenced anywhere. Runs only after the
 * write it follows has committed, and its failure is logged rather than
 * thrown: the write already succeeded and a leftover object is harmless.
 */
async function removeUnreferencedImages(supabase: SupabaseClient<Database>, paths: string[]) {
  if (paths.length === 0) return;

  try {
    await removeImages(supabase, paths);
  } catch (error) {
    console.error("Failed to remove deleted trip images", error);
  }
}

/**
 * Saves the content, then deletes storage objects for images the save
 * dropped (deletes in the editor are undoable until the save). Images the
 * published snapshot still shows are kept so the public page doesn't break.
 */
export async function updateTripContentForUser(
  supabase: SupabaseClient<Database>,
  id: string,
  ownerId: string,
  content: Trip["content"],
): Promise<Trip> {
  const previous = await findTripById(supabase, id, ownerId);
  const trip = await updateTripContent(supabase, id, ownerId, content);
  const published = await findPublishedTripById(supabase, id);

  await removeUnreferencedImages(
    supabase,
    getRemovedImagePaths(previous?.content, content, ownerId, id, [published?.content]),
  );

  return trip;
}

/** Public read of a trip's published snapshot; never exposes the draft. */
export async function getPublishedTrip(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<PublishedTrip | null> {
  return findPublishedTripById(supabase, id);
}

/** The owner's view of whether (and when) their trip is published. */
export async function getPublicationForUser(
  supabase: SupabaseClient<Database>,
  id: string,
  ownerId: string,
): Promise<PublishedTrip | null> {
  const published = await findPublishedTripById(supabase, id);
  return published?.owner_id === ownerId ? published : null;
}

/**
 * Copies the saved draft into the public snapshot, replacing any previous
 * one. The author's name and avatar are snapshotted too, since anonymous
 * readers can't look up the owner. Images (including the cover) only the old
 * snapshot referenced are then removed.
 */
export async function publishTripForUser(
  supabase: SupabaseClient<Database>,
  id: string,
  ownerId: string,
  author: UserProfile,
): Promise<PublishedTrip> {
  const trip = await findTripById(supabase, id, ownerId);
  if (!trip) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  const previous = await findPublishedTripById(supabase, id);
  const published = await upsertPublishedTrip(supabase, {
    trip_id: trip.id,
    owner_id: ownerId,
    title: trip.title,
    content: trip.content,
    cover_image_url: trip.cover_image_url,
    city_place_id: trip.city_place_id,
    city_name: trip.city_name,
    city_country_code: trip.city_country_code,
    author_name: author.name,
    author_avatar_url: author.avatarUrl,
  });

  await removeUnreferencedImages(supabase, [
    ...getRemovedImagePaths(previous?.content, trip.content, ownerId, id),
    ...getRemovedCoverPaths(previous?.cover_image_url, ownerId, id, [trip.cover_image_url]),
  ]);

  return published;
}

/** Removes the public snapshot, then any images (including the cover) only it referenced. */
export async function unpublishTripForUser(
  supabase: SupabaseClient<Database>,
  id: string,
  ownerId: string,
): Promise<void> {
  const previous = await findPublishedTripById(supabase, id);
  await deletePublishedTrip(supabase, id, ownerId);

  const trip = await findTripById(supabase, id, ownerId);
  if (!previous || !trip) return;

  await removeUnreferencedImages(supabase, [
    ...getRemovedImagePaths(previous.content, trip.content, ownerId, id),
    ...getRemovedCoverPaths(previous.cover_image_url, ownerId, id, [trip.cover_image_url]),
  ]);
}
