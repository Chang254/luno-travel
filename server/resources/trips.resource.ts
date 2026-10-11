import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Trip } from "@/server/models/trips.types";

export async function findTripsByOwnerId(
  supabase: SupabaseClient<Database>,
  ownerId: string,
): Promise<Trip[]> {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}
