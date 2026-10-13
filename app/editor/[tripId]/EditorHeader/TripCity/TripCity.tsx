"use client";

import CityPicker from "@/components/CityPicker";
import type { TripCity as TripCityColumns } from "@/server/models/trips.types";
import { useTripCity } from "./TripCity.helpers";
import { styles } from "./TripCity.styles";

interface TripCityProps {
  tripId: string;
  initialCity: TripCityColumns;
}

export default function TripCity({ tripId, initialCity }: TripCityProps) {
  const { city, selectCity, clearCity, isSaving, isError } = useTripCity(tripId, initialCity);

  return (
    <div className={styles.root}>
      <CityPicker
        aria-label="Trip city"
        placeholder="Add a city"
        value={city}
        onSelect={selectCity}
        onClear={clearCity}
        disabled={isSaving}
      />
      {isError && (
        <p role="alert" className={styles.error}>
          Couldn&apos;t save city
        </p>
      )}
    </div>
  );
}
