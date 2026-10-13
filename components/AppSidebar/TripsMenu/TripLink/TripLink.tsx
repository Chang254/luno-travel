"use client";

import { useLinkStatus } from "next/link";

import CountryFlag from "@/components/CountryFlag";
import { Spinner } from "@/components/ui/spinner";
import { styles } from "./TripLink.styles";

interface TripLinkProps {
  title: string;
  /** ISO-2 code of the trip's city, if it has one. */
  countryCode?: string | null;
}

/** Contents of a trip's sidebar link; must render inside `<Link>` so `useLinkStatus` can report pending navigation. */
export default function TripLink({ title, countryCode }: TripLinkProps) {
  const { pending } = useLinkStatus();

  return (
    <>
      {countryCode && <CountryFlag countryCode={countryCode} />}
      <span className={styles.title}>{title}</span>
      {pending && <Spinner className={styles.spinner} />}
    </>
  );
}
