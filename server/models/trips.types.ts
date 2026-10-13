import { z } from "zod";

import type { Tables } from "@/lib/supabase/database.types";
import { placesSessionTokenSchema } from "@/server/models/places.types";

export type Trip = { [K in keyof Tables<"trips">]: Tables<"trips">[K] };

export const getTripInputSchema = z.object({
  id: z.string(),
});

// Lexical's editor.getEditorState().toJSON() is always a top-level object
// ({ root: {...} }) — kept permissive since we don't hand-maintain Lexical's
// internal node schema here.
export const updateTripContentInputSchema = z.object({
  id: z.string(),
  content: z.record(z.string(), z.any()),
});

/** The trip's city columns; the name and country code are display copies of `city_place_id`. */
export type TripCity = Pick<Trip, "city_place_id" | "city_name" | "city_country_code">;

/** A picked autocomplete suggestion; the server resolves its name and country. */
export const tripCityInputSchema = z.object({
  placeId: z.string().min(1),
  sessionToken: placesSessionTokenSchema,
});

export type TripCityInput = z.infer<typeof tripCityInputSchema>;

export const tripTitleSchema = z.string().trim().min(1).max(200);

export const createTripInputSchema = z.object({
  title: tripTitleSchema,
  city: tripCityInputSchema,
});

export const updateTripDetailsInputSchema = z.object({
  id: z.string(),
  title: tripTitleSchema,
  /** Sent only when a new place was picked; omitted keeps the current one. */
  city: tripCityInputSchema.optional(),
  /** Object path from `createImageUpload`; `null` removes the cover, omitted keeps it. */
  coverImagePath: z.string().nullable().optional(),
});

export type UpdateTripDetailsInput = Omit<z.infer<typeof updateTripDetailsInputSchema>, "id">;

export const updateTripCoverInputSchema = z.object({
  id: z.string(),
  /** Object path in the trip images bucket, as returned by `createImageUpload`. */
  coverImagePath: z.string(),
});
