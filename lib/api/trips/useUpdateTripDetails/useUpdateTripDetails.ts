import { useMutation } from "@tanstack/react-query";

import { trpc } from "@/lib/trpc/client";
import type { TripCityInput } from "@/server/models/trips.types";
import { uploadTripImage } from "../useUploadTripImage/useUploadTripImage.helpers";

interface UpdateTripDetailsInput {
  id: string;
  title: string;
  /** Omit to keep the current place. */
  city?: TripCityInput;
  /** A new file to upload, `null` to remove the cover, or omitted to keep it. */
  coverImage?: File | null;
}

/** Uploads a newly chosen cover (if any), then saves the title, place and cover together. */
export function useUpdateTripDetails() {
  const utils = trpc.useUtils();

  return useMutation({
    mutationFn: async ({ id, title, city, coverImage }: UpdateTripDetailsInput) => {
      const coverImagePath =
        coverImage instanceof File ? await uploadTripImage(utils.client, id, coverImage) : coverImage;
      return utils.client.trips.updateDetails.mutate({ id, title, city, coverImagePath });
    },
    onSuccess: (trip) => {
      utils.trips.list.invalidate();
      utils.trips.get.setData({ id: trip.id }, trip);
    },
  });
}
