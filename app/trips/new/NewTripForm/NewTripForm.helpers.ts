import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCreateTrip } from "@/lib/api/trips";
import { IMAGE_EXTENSIONS, type ImageContentType } from "@/server/models/tripImages.types";
import { createTripInputSchema, tripCityInputSchema } from "@/server/models/trips.types";

const COVER_TYPES = Object.keys(IMAGE_EXTENSIONS) as ImageContentType[];

export const ACCEPTED_COVER_TYPES = COVER_TYPES.join(",");

/** Reuses the server's title rules so the form trims and validates exactly as `trips.create` will. */
export const newTripFormSchema = createTripInputSchema.extend({
  coverImage: z.file().mime(COVER_TYPES, "Choose a JPEG, PNG, GIF, WebP, or AVIF image.").nullable(),
  /** The picked suggestion plus its label; only `placeId` and `sessionToken` are sent. */
  city: tripCityInputSchema.extend({ name: z.string() }).nullable(),
});

/** Object URL for previewing a local file, revoked when the file changes or the component unmounts. */
export function useFilePreviewUrl(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}

/** Form and submit flow for the new-trip form; navigates to the editor once the trip is created. */
export function useNewTripForm() {
  const router = useRouter();
  const createTrip = useCreateTrip();
  const form = useForm({
    resolver: zodResolver(newTripFormSchema),
    mode: "onChange",
    defaultValues: { title: "", coverImage: null, city: null },
  });
  const coverImage = useWatch({ control: form.control, name: "coverImage" });
  /** Parsed synchronously so a rejected file never flashes a preview while async validation runs. */
  const coverPreviewUrl = useFilePreviewUrl(
    newTripFormSchema.shape.coverImage.safeParse(coverImage).data ?? null,
  );

  const onSubmit = form.handleSubmit(({ title, coverImage, city }) => {
    createTrip.mutate(
      { title, coverImage, city: city && { placeId: city.placeId, sessionToken: city.sessionToken } },
      { onSuccess: (trip) => router.push(`/editor/${trip.id}`) },
    );
  });

  return {
    form,
    onSubmit,
    coverPreviewUrl,
    isPending: createTrip.isPending,
    isError: createTrip.isError,
  };
}
