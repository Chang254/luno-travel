"use client";

import { usePublication } from "@/lib/api/trips";

/**
 * Whether the trip is published. `initiallyPublished` (server-loaded) covers
 * the first fetch so the status doesn't flash "Draft".
 */
export function useIsPublished(tripId: string, initiallyPublished: boolean): boolean {
  const { data: publication } = usePublication(tripId);
  return publication === undefined ? initiallyPublished : Boolean(publication);
}
