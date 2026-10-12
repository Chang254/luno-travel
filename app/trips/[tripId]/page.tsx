import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";

import TripLoading from "@/components/TripLoading";
import { createClient } from "@/lib/supabase/server";
import { getTripImageUrl } from "@/lib/supabase/storage";
import { getPublishedTrip } from "@/server/services/trips.service";

import TripReader from "./TripReader";
import { styles } from "./page.styles";

/** Deduped so metadata and the page share one query per request. */
const loadPublishedTrip = cache(async (tripId: string) => {
  const supabase = await createClient();
  return getPublishedTrip(supabase, tripId);
});

interface TripPageProps {
  params: Promise<{ tripId: string }>;
}

export async function generateMetadata({ params }: TripPageProps): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await loadPublishedTrip(tripId);

  if (!trip) return {};

  const images = trip.cover_image_url ? [getTripImageUrl(trip.cover_image_url)] : undefined;
  return { title: trip.title, openGraph: { title: trip.title, images } };
}

async function PublishedTrip({ params }: TripPageProps) {
  const { tripId } = await params;
  const trip = await loadPublishedTrip(tripId);

  if (!trip) {
    notFound();
  }

  return (
    <TripReader title={trip.title} coverImagePath={trip.cover_image_url} content={trip.content} />
  );
}

export default function TripPage({ params }: TripPageProps) {
  return (
    <div className={styles.page}>
      <Suspense fallback={<TripLoading />}>
        <PublishedTrip params={params} />
      </Suspense>
    </div>
  );
}
