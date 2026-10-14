import { TRPCError } from "@trpc/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  IMAGE_EXTENSIONS,
  type ImageContentType,
  type SignedImageUpload,
} from "@/server/models/tripImages.types";
import { createSignedImageUpload } from "@/server/resources/tripImages";
import { findTripById } from "@/server/resources/trips";
import { getTripImageFolder } from "./tripImages.helpers";

export async function createImageUploadForUser(
  supabase: SupabaseClient<Database>,
  tripId: string,
  ownerId: string,
  contentType: ImageContentType,
): Promise<SignedImageUpload> {
  const trip = await findTripById(supabase, tripId, ownerId);
  if (!trip) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  const path = `${getTripImageFolder(ownerId, tripId)}${crypto.randomUUID()}.${IMAGE_EXTENSIONS[contentType]}`;
  return createSignedImageUpload(supabase, path);
}
