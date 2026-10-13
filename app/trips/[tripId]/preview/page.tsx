import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import TripLoading from "@/components/TripLoading";
import { createClient } from "@/lib/supabase/server";
import { getTripForUser } from "@/server/services/trips.service";

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

  const trip = await getTripForUser(supabase, tripId, data.claims.sub);

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
        cityName={trip.city_name}
        cityCountryCode={trip.city_country_code}
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
