import { ImageResponse } from "next/og";

import { createClient } from "@/lib/supabase/server";
import { getTripImageUrl } from "@/lib/supabase/storage";
import { getPublishedTrip } from "@/server/services/trips.service";

import { fetchImageDataUrl } from "./ogImage.helpers";

export const alt = "A trip on Luno Travel";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens from app/globals.css (`ImageResponse` can't read CSS variables).
const ESPRESSO = "hsl(18 24.4% 16.1%)";
const IVORY = "hsl(40 42.9% 94.5%)";

interface ImageProps {
  params: Promise<{ tripId: string }>;
}

/**
 * Share card for a published trip: cover as backdrop, title, and the author
 * snapshotted at publish time. Inline styles are required here; `ImageResponse`
 * doesn't support Tailwind class strings from `.styles.ts`.
 */
export default async function Image({ params }: ImageProps) {
  const { tripId } = await params;
  const supabase = await createClient();
  const trip = await getPublishedTrip(supabase, tripId);

  const [cover, avatar] = await Promise.all([
    fetchImageDataUrl(trip?.cover_image_url ? getTripImageUrl(trip.cover_image_url) : null),
    fetchImageDataUrl(trip?.author_avatar_url ?? null),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: ESPRESSO,
          color: IVORY,
        }}
      >
        {cover && (
          <img
            src={cover}
            alt=""
            width={size.width}
            height={size.height}
            style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: 72,
            gap: 28,
            backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.75) 100%)",
          }}
        >
          <div style={{ fontSize: 22, letterSpacing: 6, textTransform: "uppercase", opacity: 0.85 }}>
            Luno Travel
          </div>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, display: "flex" }}>
            {trip?.title ?? "A travel journal"}
          </div>
          {trip?.author_name && (
            <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 30 }}>
              {avatar && (
                <img
                  src={avatar}
                  alt=""
                  width={64}
                  height={64}
                  style={{ borderRadius: 9999, border: `3px solid ${IVORY}` }}
                />
              )}
              <span>by {trip.author_name}</span>
            </div>
          )}
        </div>
      </div>
    ),
    size,
  );
}
