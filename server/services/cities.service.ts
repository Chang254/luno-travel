import { TRPCError } from "@trpc/server";

import type { CityDetails, CitySuggestion, GeoNamesCity } from "@/server/models/cities.types";
import { loadCities } from "@/server/resources/cities.resource";

const MAX_SUGGESTIONS = 8;

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

/** Exact name, then name prefix, then a later word's prefix ("york" → "New York City"). */
enum MatchRank {
  Exact,
  Prefix,
  WordPrefix,
}

interface IndexedCity {
  city: GeoNamesCity;
  /** Normalized name and ASCII name. */
  keys: string[];
}

/** Lowercase words without accents or punctuation, so "sao paulo" finds "São Paulo". */
export function normalizeCityText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

const indexes = new WeakMap<GeoNamesCity[], IndexedCity[]>();

/** Normalizes every name once per loaded list rather than on each keystroke. */
function getIndex(cities: GeoNamesCity[]): IndexedCity[] {
  let index = indexes.get(cities);
  if (!index) {
    index = cities.map((city) => {
      const [, name, asciiName] = city;
      return { city, keys: [normalizeCityText(name), normalizeCityText(asciiName)].filter(Boolean) };
    });
    indexes.set(cities, index);
  }
  return index;
}

function getMatchRank(keys: string[], query: string): MatchRank | null {
  if (keys.some((key) => key === query)) return MatchRank.Exact;
  if (keys.some((key) => key.startsWith(query))) return MatchRank.Prefix;
  if (keys.some((key) => key.includes(` ${query}`))) return MatchRank.WordPrefix;
  return null;
}

function getCountryName(countryCode: string): string {
  return countryNames.of(countryCode) ?? countryCode;
}

/** Whether the text after a comma ("portland, maine", "paris, fr") fits the city's region or country. */
function matchesQualifier([, , , countryCode, regionName]: GeoNamesCity, qualifier: string) {
  return (
    countryCode.toLowerCase() === qualifier ||
    normalizeCityText(regionName).startsWith(qualifier) ||
    normalizeCityText(getCountryName(countryCode)).startsWith(qualifier)
  );
}

function toSuggestion([geonameId, name, , countryCode, regionName]: GeoNamesCity): CitySuggestion {
  return {
    geonameId,
    primaryText: name,
    secondaryText: [regionName, getCountryName(countryCode)].filter(Boolean).join(", "),
    countryCode,
  };
}

/**
 * Best matches for a typed city name, optionally narrowed by a region or
 * country after a comma. Within each match rank, larger cities come first.
 */
export async function searchCities(query: string): Promise<CitySuggestion[]> {
  const [namePart, qualifierPart = ""] = query.split(",");
  const name = normalizeCityText(namePart);
  const qualifier = normalizeCityText(qualifierPart);
  if (!name) return [];

  const ranked: GeoNamesCity[][] = [[], [], []];
  for (const { city, keys } of getIndex(await loadCities())) {
    const rank = getMatchRank(keys, name);
    if (rank === null || ranked[rank].length >= MAX_SUGGESTIONS) continue;
    if (qualifier && !matchesQualifier(city, qualifier)) continue;
    ranked[rank].push(city);
    if (ranked[MatchRank.Exact].length >= MAX_SUGGESTIONS) break;
  }

  return ranked.flat().slice(0, MAX_SUGGESTIONS).map(toSuggestion);
}

/** Looks up a picked city server-side so its stored details come from GeoNames, not the client. */
export async function getCityDetails(geonameId: number): Promise<CityDetails> {
  const city = (await loadCities()).find(([id]) => id === geonameId);
  if (!city) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown city" });
  }

  const [, name, , countryCode, , latitude, longitude] = city;
  return { name, countryCode, latitude, longitude };
}
