import * as flags from "country-flag-icons/string/3x2";

import { getCountryName } from "@/components/CountryFlag/CountryFlag.helpers";

/** Formats Satori (behind `ImageResponse`) can decode; WebP/AVIF covers are skipped. */
const SUPPORTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"];

/**
 * Fetches an image as a data URL for `ImageResponse`. Returns null when the
 * fetch fails or the format is unsupported, so one bad image (e.g. an
 * expired Google avatar) drops out instead of failing the whole card.
 */
export async function fetchImageDataUrl(url: string | null): Promise<string | null> {
  if (!url) return null;

  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type")?.split(";")[0].trim() ?? "";
    if (!response.ok || !SUPPORTED_IMAGE_TYPES.includes(contentType)) return null;

    const base64 = Buffer.from(await response.arrayBuffer()).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

/**
 * Inline SVG flag for an ISO-2 code, from the same set `app/flags` serves, so
 * the card needn't fetch its own route. Null when there's no matching flag.
 */
export function getFlagDataUrl(countryCode: string | null): string | null {
  const svg = countryCode ? flags[countryCode.toUpperCase() as keyof typeof flags] : undefined;
  if (typeof svg !== "string") return null;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/** Share text naming the trip's city, e.g. "A trip to Kyoto, Japan". Null without a city. */
export function getShareDescription(cityName: string | null, countryCode: string | null): string | null {
  if (!cityName) return null;
  return countryCode ? `A trip to ${cityName}, ${getCountryName(countryCode)}` : `A trip to ${cityName}`;
}
