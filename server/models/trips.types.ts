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
