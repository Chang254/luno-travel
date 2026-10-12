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
