import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { getPublicationForUser, getTripForUser } from "@/server/services/trips";

import EditorHeader from "./EditorHeader";
import TripLoading from "@/components/TripLoading";
import LexicalEditor from "./LexicalEditor";
import { styles } from "./editor.styles";

interface AuthenticatedEditorProps {
  params: Promise<{ tripId: string }>;
}

async function AuthenticatedEditor({ params }: AuthenticatedEditorProps) {
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
      <EditorHeader
        tripId={trip.id}
        details={{
          title: trip.title,
          cover_image_url: trip.cover_image_url,
          city: trip.city,
        }}
        isPublished={publication !== null}
      />
      <div className={styles.editorContent}>
        <LexicalEditor tripId={trip.id} initialContent={trip.content} />
      </div>
    </>
  );
}

interface EditorPageProps {
  params: Promise<{ tripId: string }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  return (
    <div className={styles.editorContainer}>
      <Suspense fallback={<TripLoading />}>
        <AuthenticatedEditor params={params} />
      </Suspense>
    </div>
  );
}
