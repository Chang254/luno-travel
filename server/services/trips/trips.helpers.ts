import { TRPCError } from "@trpc/server";
import type { TripCity, TripCityInput } from "@/server/models/trips.types";
import { isTripImagePath } from "@/server/services/tripImages";

/** Postgres error code for a foreign key violation. */
const FOREIGN_KEY_VIOLATION = "23503";

export function toTripCity({ geonameId }: TripCityInput): TripCity {
  return { city_id: geonameId };
}

/** A picked city id missing from `cities` fails its foreign key; report that as bad input. */
export async function withCityCheck<T>(write: Promise<T>): Promise<T> {
  try {
    return await write;
  } catch (error) {
    if ((error as { code?: string }).code === FOREIGN_KEY_VIOLATION) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown city" });
    }
    throw error;
  }
}

/** Covers must sit in this trip's image folder so a client can't point one at another user's object. */
export function assertTripImagePath(ownerId: string, id: string, path: string) {
  if (!isTripImagePath(path, ownerId, id)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid cover image path" });
  }
}
