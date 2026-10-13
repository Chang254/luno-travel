import { keepPreviousData } from "@tanstack/react-query";

import { trpc } from "@/lib/trpc/client";

const MIN_QUERY_LENGTH = 2;

/** City autocomplete over the bundled GeoNames list. */
export function useCitySearch(query: string) {
  const trimmed = query.trim();

  return trpc.cities.search.useQuery(
    { query: trimmed },
    { enabled: trimmed.length >= MIN_QUERY_LENGTH, placeholderData: keepPreviousData },
  );
}
