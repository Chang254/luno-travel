import { redirect } from "next/navigation";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";

import NewTripForm from "./NewTripForm";
import { styles } from "./page.styles";

async function AuthenticatedNewTrip() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return <NewTripForm />;
}

export default function NewTripPage() {
  return (
    <div className={styles.page}>
      <div className={styles.formWrapper}>
        <Suspense>
          <AuthenticatedNewTrip />
        </Suspense>
      </div>
    </div>
  );
}
