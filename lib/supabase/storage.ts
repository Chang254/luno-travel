export const TRIP_IMAGES_BUCKET = "Luno Images";

/** Public URL for an object path in the (public) trip images bucket. */
export function getTripImageUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent(TRIP_IMAGES_BUCKET)}/${path}`;
}
