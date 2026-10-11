import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * In the browser this returns "" so requests are relative to the current
 * origin (VERCEL_URL is server-only and would otherwise fall back to localhost).
 *
 * Note: VERCEL_URL reflects the deployment URL, not a custom domain, so the
 * server-side value will be wrong if the app is ever deployed behind one.
 */
export function getBaseUrl() {
  if (typeof window !== "undefined") return "";

  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
