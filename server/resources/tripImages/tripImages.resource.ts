import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { TRIP_IMAGES_BUCKET } from "@/lib/supabase/storage";
import type { SignedImageUpload } from "@/server/models/tripImages.types";

export async function createSignedImageUpload(
  supabase: SupabaseClient<Database>,
  path: string,
): Promise<SignedImageUpload> {
  const { data, error } = await supabase.storage
    .from(TRIP_IMAGES_BUCKET)
    .createSignedUploadUrl(path);

  if (error) throw error;
  return { path: data.path, token: data.token };
}

export async function removeImages(
  supabase: SupabaseClient<Database>,
  paths: string[],
): Promise<void> {
  const { error } = await supabase.storage.from(TRIP_IMAGES_BUCKET).remove(paths);

  if (error) throw error;
}
