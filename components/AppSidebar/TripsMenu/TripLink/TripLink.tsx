"use client";

import { useLinkStatus } from "next/link";

import { Spinner } from "@/components/ui/spinner";
import { styles } from "./TripLink.styles";

interface TripLinkProps {
  title: string;
}

/** Contents of a trip's sidebar link; must render inside `<Link>` so `useLinkStatus` can report pending navigation. */
export default function TripLink({ title }: TripLinkProps) {
  const { pending } = useLinkStatus();

  return (
    <>
      <span className={styles.title}>{title}</span>
      {pending && <Spinner className={styles.spinner} />}
    </>
  );
}
