import { keepPreviousData } from "@tanstack/react-query";

import { trpc } from "@/lib/trpc/client";

const MIN_QUERY_LENGTH = 2;

/** City autocomplete; pass the picker's session token so Google bills the keystrokes as one session. */
export function useCitySearch(query: string, sessionToken: string) {
  const trimmed = query.trim();

  return trpc.places.searchCities.useQuery(
    { query: trimmed, sessionToken },
    { enabled: trimmed.length >= MIN_QUERY_LENGTH, placeholderData: keepPreviousData },
  );
}
