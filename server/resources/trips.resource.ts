import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Trip, TripCity } from "@/server/models/trips.types";

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

export async function findTripById(
  supabase: SupabaseClient<Database>,
  id: string,
  ownerId: string,
): Promise<Trip | null> {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateTripContent(
  supabase: SupabaseClient<Database>,
  id: string,
  ownerId: string,
  content: Trip["content"],
): Promise<Trip> {
  const { data, error } = await supabase
    .from("trips")
    .update({ content })
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function insertTrip(
  supabase: SupabaseClient<Database>,
  ownerId: string,
  title: string,
  city?: TripCity,
): Promise<Trip> {
  const { data, error } = await supabase
    .from("trips")
    .insert({ owner_id: ownerId, title, ...city })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateTripCover(
  supabase: SupabaseClient<Database>,
  id: string,
  ownerId: string,
  coverImagePath: string,
): Promise<Trip> {
  const { data, error } = await supabase
    .from("trips")
    .update({ cover_image_url: coverImagePath })
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateTripCity(
  supabase: SupabaseClient<Database>,
  id: string,
  ownerId: string,
  city: TripCity,
): Promise<Trip> {
  const { data, error } = await supabase
    .from("trips")
    .update(city)
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
