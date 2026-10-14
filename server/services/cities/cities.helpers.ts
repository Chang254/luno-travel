import type { City, CitySuggestion } from "@/server/models/cities.types";

export function toSuggestion({ id, name, country_code, country_name, region_name }: City): CitySuggestion {
  return {
    geonameId: id,
    primaryText: name,
    secondaryText: [region_name, country_name].filter(Boolean).join(", "),
    countryCode: country_code,
  };
}
