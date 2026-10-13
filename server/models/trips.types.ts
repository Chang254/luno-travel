import { z } from "zod";

import type { Tables } from "@/lib/supabase/database.types";
import type { TripCityView } from "@/server/models/cities.types";

/** A trip row with its city embedded. */
export type Trip = { [K in keyof Tables<"trips">]: Tables<"trips">[K] } & { city: TripCityView };

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

/** The trip's reference to its row in `cities`. */
export type TripCity = Pick<Tables<"trips">, "city_id">;

/** A picked autocomplete suggestion; its id must exist in `cities`. */
export const tripCityInputSchema = z.object({
  geonameId: z.number().int().positive(),
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
