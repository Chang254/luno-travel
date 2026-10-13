/** Served by `app/flags/[file]/route.ts`. */
export function getFlagUrl(countryCode: string): string {
  return `/flags/${countryCode.toUpperCase()}.svg`;
}

/**
 * English country name for an ISO-2 code ("JP" → "Japan"). A fixed locale keeps
 * server and client renders identical; falls back to the code if unknown.
 */
export function getCountryName(countryCode: string): string {
  try {
    return new Intl.DisplayNames("en", { type: "region" }).of(countryCode.toUpperCase()) ?? countryCode;
  } catch {
    return countryCode;
  }
}
