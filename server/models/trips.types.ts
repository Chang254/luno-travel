import { z } from "zod";

import type { Tables } from "@/lib/supabase/database.types";

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

export const createTripInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export const updateTripCoverInputSchema = z.object({
  id: z.string(),
  /** Object path in the trip images bucket, as returned by `createImageUpload`. */
  coverImagePath: z.string(),
});
