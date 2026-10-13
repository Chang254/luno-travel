import { type RefObject, useEffect, useState } from "react";

import { useCitySearch } from "@/lib/api/places";
import type { CitySuggestion } from "@/server/models/places.types";
import type { TripCityInput } from "@/server/models/trips.types";

const SEARCH_DEBOUNCE_MS = 250;
const MIN_QUERY_LENGTH = 2;

/** What the input shows for the current city. */
export interface CityPickerValue {
  name: string;
  /** Known once the server has resolved the place. */
  countryCode?: string | null;
}

/** A picked suggestion: what the server needs to resolve it, plus a label to show meanwhile. */
export type PickedCity = TripCityInput & Pick<CityPickerValue, "name">;

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

interface UseCityPickerOptions {
  value: CityPickerValue | null;
  onSelect: (city: PickedCity) => void;
  onClear?: () => void;
}

/**
 * Search and edit state for the city combobox. One Google session token covers
 * every keystroke until a city is picked; picking starts a fresh session.
 * Emptying the input and leaving it (or pressing Enter) clears the city; any
 * other unpicked text reverts to the current city.
 */
export function useCityPicker({ value, onSelect, onClear }: UseCityPickerOptions) {
  const [open, setOpen] = useState(false);
  /** Null while not editing, so the input shows the current city. */
  const [query, setQuery] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState(() => crypto.randomUUID());
  const debouncedQuery = useDebouncedValue(query ?? "", SEARCH_DEBOUNCE_MS);
  /** Closed means no search, so the stale debounced query can't fire on a fresh token after a pick. */
  const searchQuery = open ? debouncedQuery : "";
  const search = useCitySearch(searchQuery, sessionToken);
  const suggestions = searchQuery.trim().length >= MIN_QUERY_LENGTH ? (search.data ?? []) : [];

  const reset = () => {
    setQuery(null);
    setOpen(false);
  };

  const changeQuery = (next: string) => {
    setQuery(next);
    setOpen(true);
  };

  /** Ends editing: an emptied input clears the city, anything else reverts. */
  const commit = () => {
    if (query !== null && query.trim() === "" && value) onClear?.();
    reset();
  };

  const selectSuggestion = (suggestion: CitySuggestion) => {
    onSelect({ placeId: suggestion.placeId, sessionToken, name: suggestion.primaryText });
    setSessionToken(crypto.randomUUID());
    reset();
  };

  return {
    open,
    setOpen,
    inputValue: query ?? value?.name ?? "",
    isEmptyQuery: query !== null && query.trim() === "",
    changeQuery,
    commit,
    cancel: reset,
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

/**
 * DOM id of the highlighted option, for the input's `aria-activedescendant`.
 * cmdk assigns item ids itself, so read it back after each highlight change.
 */
export function useActiveOptionId(listRef: RefObject<HTMLElement | null>, highlighted: string) {
  const [activeId, setActiveId] = useState<string>();

  useEffect(() => {
    setActiveId(listRef.current?.querySelector('[cmdk-item][data-selected="true"]')?.id);
  }, [listRef, highlighted]);

  return activeId;
}
