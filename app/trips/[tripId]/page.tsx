import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";

import TripLoading from "@/components/TripLoading";
import { createClient } from "@/lib/supabase/server";
import { getPublishedTrip } from "@/server/services/trips.service";

import { getShareDescription } from "./ogImage.helpers";
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

  const description = getShareDescription(trip.city_name, trip.city_country_code) ?? undefined;

  // The share image comes from ./opengraph-image.tsx.
  return { title: trip.title, description, openGraph: { title: trip.title, description } };
}

async function PublishedTrip({ params }: TripPageProps) {
  const { tripId } = await params;
  const trip = await loadPublishedTrip(tripId);

  if (!trip) {
    notFound();
  }

  return (
    <TripReader
      title={trip.title}
      coverImagePath={trip.cover_image_url}
      content={trip.content}
      cityName={trip.city_name}
      cityCountryCode={trip.city_country_code}
    />
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
