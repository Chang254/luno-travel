"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getBaseUrl } from "@/lib/utils";

/**
 * Derives the origin from the incoming request so the OAuth callback returns
 * to whichever host the user is actually on (custom domain, preview, local).
 */
async function getRequestOrigin() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) return getBaseUrl();

  const proto =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${await getRequestOrigin()}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect(`/auth/error?error=${encodeURIComponent(error?.message ?? "oauth_init_failed")}`);
  }

  redirect(data.url);
}
