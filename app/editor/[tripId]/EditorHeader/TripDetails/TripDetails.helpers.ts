"use client";

import { useState } from "react";

import type { Trip } from "@/server/models/trips.types";

/** The trip fields the header shows and the details dialog edits. */
export type TripDetailsColumns = Pick<Trip, "title" | "cover_image_url" | "city">;

function pickTripDetails({
  title,
  cover_image_url,
  city,
}: TripDetailsColumns): TripDetailsColumns {
  return { title, cover_image_url, city };
}

/** Server-loaded details, replaced by the saved trip after each edit. */
export function useTripDetails(initialDetails: TripDetailsColumns) {
  const [details, setDetails] = useState(initialDetails);
  return { details, updateDetails: (saved: TripDetailsColumns) => setDetails(pickTripDetails(saved)) };
}
