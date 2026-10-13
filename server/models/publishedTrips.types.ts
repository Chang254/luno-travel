import type { Tables } from "@/lib/supabase/database.types";
import type { TripCityView } from "@/server/models/cities.types";

/** Columns of a published snapshot, as written on publish. */
export type PublishedTripRow = { [K in keyof Tables<"published_trips">]: Tables<"published_trips">[K] };

/**
 * Frozen public snapshot of a trip, written on publish, with its city
 * embedded. The draft stays in `trips`.
 */
export type PublishedTrip = PublishedTripRow & { city: TripCityView | null };
