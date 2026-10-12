import type { trpc } from "@/lib/trpc/client";
import { createClient } from "@/lib/supabase/client";
import { TRIP_IMAGES_BUCKET } from "@/lib/supabase/storage";
import type { ImageContentType } from "@/server/models/tripImages.types";

type TRPCUtilsClient = ReturnType<typeof trpc.useUtils>["client"];

/**
 * Asks the API for a signed upload URL (which checks trip ownership and picks
 * the object path), then uploads the file straight to Storage from the browser.
 * Resolves to the stored object path.
 */
export async function uploadTripImage(client: TRPCUtilsClient, tripId: string, file: File) {
  const { path, token } = await client.trips.createImageUpload.mutate({
    tripId,
    contentType: file.type as ImageContentType,
  });

  const supabase = createClient();
  const { error } = await supabase.storage
    .from(TRIP_IMAGES_BUCKET)
    .uploadToSignedUrl(path, token, file, { contentType: file.type });

  if (error) throw error;
  return path;
}
