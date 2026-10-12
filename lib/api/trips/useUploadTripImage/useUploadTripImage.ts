import { useMutation } from "@tanstack/react-query";

import { trpc } from "@/lib/trpc/client";
import { uploadTripImage } from "./useUploadTripImage.helpers";

interface UploadTripImageInput {
  tripId: string;
  file: File;
}

/** Uploads an image into a trip's storage folder. Resolves to the stored object path. */
export function useUploadTripImage() {
  const utils = trpc.useUtils();

  return useMutation({
    mutationFn: ({ tripId, file }: UploadTripImageInput) => uploadTripImage(utils.client, tripId, file),
  });
}
