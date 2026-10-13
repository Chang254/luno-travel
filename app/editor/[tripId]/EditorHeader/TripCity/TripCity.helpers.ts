"use client";

import { useState } from "react";

import type { CityPickerValue, PickedCity } from "@/components/CityPicker/CityPicker.helpers";
import { useUpdateTripCity } from "@/lib/api/trips";
import type { TripCity } from "@/server/models/trips.types";

export function toCityPickerValue(city: TripCity): CityPickerValue | null {
  return city.city_name ? { name: city.city_name, countryCode: city.city_country_code } : null;
}

/**
 * Saves the trip's city as soon as it's picked or cleared. The picked label
 * shows immediately; it's replaced by the server's resolved city (with its
 * flag) on success, or rolled back on failure.
 */
export function useTripCity(tripId: string, initialCity: TripCity) {
  const updateCity = useUpdateTripCity();
  const [city, setCity] = useState(() => toCityPickerValue(initialCity));

  const save = (next: PickedCity | null) => {
    const previous = city;
    setCity(next && { name: next.name });
    updateCity.mutate(
      { id: tripId, city: next && { placeId: next.placeId, sessionToken: next.sessionToken } },
      {
        onSuccess: (trip) => setCity(toCityPickerValue(trip)),
        onError: () => setCity(previous),
      },
    );
  };

  return {
    city,
    selectCity: (picked: PickedCity) => save(picked),
    clearCity: () => save(null),
    isSaving: updateCity.isPending,
    isError: updateCity.isError,
  };
}
