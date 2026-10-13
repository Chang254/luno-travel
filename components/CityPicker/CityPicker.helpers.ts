import { useEffect, useState } from "react";

import { useCitySearch } from "@/lib/api/places";
import type { CitySuggestion } from "@/server/models/places.types";
import type { TripCityInput } from "@/server/models/trips.types";

const SEARCH_DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 2;

/** What the trigger shows for the current city. */
export interface CityPickerValue {
  name: string;
  /** e.g. "Kyoto, Japan"; only known right after picking a suggestion. */
  detail?: string;
  /** Known once the server has resolved the place. */
  countryCode?: string | null;
}

/** A picked suggestion: what the server needs to resolve it, plus a label to show meanwhile. */
export type PickedCity = TripCityInput & Required<Pick<CityPickerValue, "name" | "detail">>;

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}

interface SearchStatus {
  query: string;
  isFetching: boolean;
  isError: boolean;
  resultCount: number;
}

/** Message shown in place of results, or null when results (or nothing yet) should show. */
export function getSearchStatusMessage({ query, isFetching, isError, resultCount }: SearchStatus) {
  if (query.trim().length < MIN_QUERY_LENGTH) return null;
  if (isError) return "Couldn't search cities. Try again.";
  if (resultCount > 0) return null;
  return isFetching ? "Searching…" : "No cities found.";
}

/**
 * Search state for the city combobox. One Google session token covers every
 * keystroke until a city is picked; picking starts a fresh session.
 */
export function useCityPicker(onSelect: (city: PickedCity) => void) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sessionToken, setSessionToken] = useState(() => crypto.randomUUID());
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  /** Closed means no search, so the stale debounced query can't fire on a fresh token after a pick. */
  const searchQuery = open ? debouncedQuery : "";
  const search = useCitySearch(searchQuery, sessionToken);
  const suggestions = searchQuery.trim().length >= MIN_QUERY_LENGTH ? (search.data ?? []) : [];

  const selectSuggestion = (suggestion: CitySuggestion) => {
    onSelect({
      placeId: suggestion.placeId,
      sessionToken,
      name: suggestion.primaryText,
      detail: suggestion.secondaryText,
    });
    setSessionToken(crypto.randomUUID());
    setQuery("");
    setOpen(false);
  };

  return {
    open,
    setOpen,
    query,
    setQuery,
    suggestions,
    statusMessage: getSearchStatusMessage({
      query: searchQuery,
      isFetching: search.isFetching,
      isError: search.isError,
      resultCount: suggestions.length,
    }),
    selectSuggestion,
  };
}
