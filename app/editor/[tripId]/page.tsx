import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { getTripForUser } from "@/server/services/trips.service";

import EditorHeader from "./EditorHeader";
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

  const trip = await getTripForUser(supabase, tripId, data.claims.sub);

  if (!trip) {
    notFound();
  }

  return (
    <>
      <EditorHeader title={trip.title} tripId={trip.id} />
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
      <Suspense>
        <AuthenticatedEditor params={params} />
      </Suspense>
    </div>
  );
}
