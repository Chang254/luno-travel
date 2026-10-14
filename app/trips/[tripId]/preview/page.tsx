import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import TripLoading from "@/components/TripLoading";
import { getUserProfile } from "@/lib/auth/userProfile";
import { createClient } from "@/lib/supabase/server";
import { getPublicationForUser, getTripForUser } from "@/server/services/trips";

import TripByline from "../TripByline";
import TripReader from "../TripReader";
import PreviewBar from "./PreviewBar";
import { styles } from "../page.styles";

interface PreviewPageProps {
  params: Promise<{ tripId: string }>;
}

/** The owner's saved draft in the reader layout, before publishing. */
async function DraftPreview({ params }: PreviewPageProps) {
  const { tripId } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const [trip, publication] = await Promise.all([
    getTripForUser(supabase, tripId, data.claims.sub),
    getPublicationForUser(supabase, tripId, data.claims.sub),
  ]);

  if (!trip) {
    notFound();
  }

  return (
    <>
      <PreviewBar tripId={trip.id} />
      <TripReader
        title={trip.title}
        coverImagePath={trip.cover_image_url}
        content={trip.content}
        byline={
          <TripByline
            // The draft isn't snapshotted, so show the owner as they'll appear once published.
            author={getUserProfile(data.claims)}
            cityName={trip.city.name}
            cityCountryCode={trip.city.country_code}
            publishedAt={publication?.published_at ?? null}
          />
        }
      />
    </>
  );
}

export default function PreviewPage({ params }: PreviewPageProps) {
  return (
    <div className={styles.page}>
      <Suspense fallback={<TripLoading />}>
        <DraftPreview params={params} />
      </Suspense>
    </div>
  );
}
