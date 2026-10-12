import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * In the browser this returns "" so requests are relative to the current
 * origin (VERCEL_URL is server-only and would otherwise fall back to localhost).
 *
 * In production this is the project's production domain. VERCEL_URL is the
 * per-deployment URL, which sits behind Vercel Deployment Protection, so
 * crawlers (Discord, Slack, X) fetching OG images from it get a login redirect.
 * Previews still use VERCEL_URL.
 */
export function getBaseUrl() {
  if (typeof window !== "undefined") return "";

  const host =
    (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    process.env.VERCEL_URL;

  return host ? `https://${host}` : "http://localhost:3000";
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
