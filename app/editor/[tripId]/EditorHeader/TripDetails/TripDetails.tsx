"use client";

import CountryFlag from "@/components/CountryFlag";
import { type TripDetailsColumns, useTripDetails } from "./TripDetails.helpers";
import TripDetailsDialog from "./TripDetailsDialog";
import { styles } from "./TripDetails.styles";

interface TripDetailsProps {
  tripId: string;
  initialDetails: TripDetailsColumns;
}

/** The trip's title and place, with a button to edit them and the cover. */
export default function TripDetails({ tripId, initialDetails }: TripDetailsProps) {
  const { details, updateDetails } = useTripDetails(initialDetails);

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>{details.title}</h1>
      <span className={styles.place}>
        <CountryFlag countryCode={details.city_country_code} />
        {details.city_name}
      </span>
      <TripDetailsDialog tripId={tripId} details={details} onSaved={updateDetails} />
    </div>
  );
}
