"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getBaseUrl } from "@/lib/utils";

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getBaseUrl()}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect(`/auth/error?error=${encodeURIComponent(error?.message ?? "oauth_init_failed")}`);
  }

  redirect(data.url);
}
