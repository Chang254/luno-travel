"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import {
  type TripDetailsFormInput,
  tripDetailsFormSchema,
} from "@/components/TripDetailsFields/TripDetailsFields.helpers";
import { useUpdateTripDetails } from "@/lib/api/trips";
import type { TripDetailsColumns } from "../TripDetails.helpers";

export function toFormValues(details: TripDetailsColumns): TripDetailsFormInput {
  return {
    title: details.title,
    city: { name: details.city.name, countryCode: details.city.country_code },
    coverImage: details.cover_image_url,
  };
}

/**
 * The update to send: the place only when a new one was picked (it carries a
 * GeoNames id), and the cover only when it was replaced or removed.
 */
export function toUpdateInput(tripId: string, values: z.output<typeof tripDetailsFormSchema>) {
  const { title, city, coverImage } = values;
  return {
    id: tripId,
    title,
    city: city.geonameId === undefined ? undefined : { geonameId: city.geonameId },
    coverImage: typeof coverImage === "string" ? undefined : coverImage,
  };
}

interface UseTripDetailsDialogOptions {
  tripId: string;
  details: TripDetailsColumns;
  /** Receives the saved trip. */
  onSaved: (saved: TripDetailsColumns) => void;
}

/** Open state and form for the details dialog; each opening starts from the current details. */
export function useTripDetailsDialog({ tripId, details, onSaved }: UseTripDetailsDialogOptions) {
  const [open, setOpen] = useState(false);
  const updateDetails = useUpdateTripDetails();
  const form = useForm({
    resolver: zodResolver(tripDetailsFormSchema),
    mode: "onChange",
    defaultValues: toFormValues(details),
  });

  const changeOpen = (next: boolean) => {
    if (next) {
      form.reset(toFormValues(details));
      updateDetails.reset();
    }
    setOpen(next);
  };

  const onSubmit = form.handleSubmit((values) => {
    updateDetails.mutate(toUpdateInput(tripId, values), {
      onSuccess: (trip) => {
        onSaved(trip);
        setOpen(false);
      },
    });
  });

  return {
    open,
    changeOpen,
    form,
    onSubmit,
    isPending: updateDetails.isPending,
    isError: updateDetails.isError,
  };
}
