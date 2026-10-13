/**
 * e.g. "October 12, 2026". Formatted in UTC so the server render and the
 * browser's hydration agree regardless of the reader's time zone.
 */
export function formatPublishedDate(publishedAt: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(publishedAt),
  );
}
