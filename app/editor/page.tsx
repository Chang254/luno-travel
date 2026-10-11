import { redirect } from "next/navigation";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";

import EditorHeader from "./EditorHeader";
import LexicalEditor from "./LexicalEditor";
import { styles } from "./editor.styles";

export default async function EditorPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className={styles.editorContainer}>
      <EditorHeader />
      <div className={styles.editorContent}>
        <Suspense>
          <LexicalEditor />
        </Suspense>
      </div>
    </div>
  );
}
