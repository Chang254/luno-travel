import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { GeoNamesCity } from "@/server/models/cities.types";

/** Also listed in `outputFileTracingIncludes` in next.config.ts so it ships with the server. */
const CITIES_PATH = join(process.cwd(), "server/data/cities.json");

let citiesPromise: Promise<GeoNamesCity[]> | undefined;

/** Every city, largest first. Read once per server instance and kept in memory. */
export function loadCities(): Promise<GeoNamesCity[]> {
  citiesPromise ??= readFile(CITIES_PATH, "utf8")
    .then((json): GeoNamesCity[] => JSON.parse(json))
    .catch((error) => {
      // Not cached, so the next request retries the read.
      citiesPromise = undefined;
      throw error;
    });
  return citiesPromise;
}
