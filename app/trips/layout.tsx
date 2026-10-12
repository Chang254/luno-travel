import type { Metadata } from "next";

/** Trips are user content, so they don't inherit the site tagline as their description. */
export const metadata: Metadata = {
  description: null,
};

export default function TripsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
