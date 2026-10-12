import type { Tables } from "@/lib/supabase/database.types";

/** Frozen public snapshot of a trip, written on publish. The draft stays in `trips`. */
export type PublishedTrip = { [K in keyof Tables<"published_trips">]: Tables<"published_trips">[K] };
