import { useMutation } from "@tanstack/react-query";

import { trpc } from "@/lib/trpc/client";
import type { TripCityInput } from "@/server/models/trips.types";
import { uploadTripImage } from "../useUploadTripImage/useUploadTripImage.helpers";

interface CreateTripInput {
  title: string;
  coverImage?: File | null;
  city?: TripCityInput | null;
}

/**
 * Creates the trip, then (if given) uploads the cover into the new trip's
 * folder and saves its path. The trip has to exist first because image paths
 * are scoped by trip id.
 */
export function useCreateTrip() {
  const utils = trpc.useUtils();

  return useMutation({
    mutationFn: async ({ title, coverImage, city }: CreateTripInput) => {
      const trip = await utils.client.trips.create.mutate({ title, city: city ?? undefined });
      if (!coverImage) return trip;

      const coverImagePath = await uploadTripImage(utils.client, trip.id, coverImage);
      return utils.client.trips.updateCover.mutate({ id: trip.id, coverImagePath });
    },
    onSettled: () => {
      utils.trips.list.invalidate();
    },
  });
}
