import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";

import TripLoading from "@/components/TripLoading";
import { createClient } from "@/lib/supabase/server";
import { getPublishedTrip } from "@/server/services/trips";

import { getShareDescription } from "./ogImage.helpers";
import TripByline from "./TripByline";
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

  const description = getShareDescription(trip.city?.name ?? null, trip.city?.country_code ?? null) ?? undefined;

  const authors = trip.author_name ? [trip.author_name] : undefined;

  // The share image comes from ./opengraph-image.tsx.
  return {
    title: trip.title,
    description,
    authors: authors?.map((name) => ({ name })),
    openGraph: {
      type: "article",
      title: trip.title,
      description,
      publishedTime: trip.published_at,
      authors,
    },
  };
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
      byline={
        <TripByline
          author={{ name: trip.author_name, avatarUrl: trip.author_avatar_url }}
          cityName={trip.city?.name ?? null}
          cityCountryCode={trip.city?.country_code ?? null}
          publishedAt={trip.published_at}
        />
      }
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
