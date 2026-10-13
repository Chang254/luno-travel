import { useEffect, useState } from "react";
import { z } from "zod";

import type { CityPickerValue } from "@/components/CityPicker/CityPicker.helpers";
import { getTripImageUrl } from "@/lib/supabase/storage";
import { IMAGE_EXTENSIONS, type ImageContentType } from "@/server/models/tripImages.types";
import { tripCityInputSchema, tripTitleSchema } from "@/server/models/trips.types";

const COVER_TYPES = Object.keys(IMAGE_EXTENSIONS) as ImageContentType[];

export const ACCEPTED_COVER_TYPES = COVER_TYPES.join(",");

const PLACE_REQUIRED = "Choose a place.";
const UNSUPPORTED_COVER = "Choose a JPEG, PNG, GIF, WebP, or AVIF image.";

/** A stored cover's object path, a newly chosen file, or no cover. */
export type CoverValue = string | File | null;

export function isAcceptedCover(cover: CoverValue): boolean {
  return !(cover instanceof File) || COVER_TYPES.includes(cover.type as ImageContentType);
}

const coverImageSchema = z
  .union([z.string(), z.instanceof(File)])
  .nullable()
  .refine(isAcceptedCover, UNSUPPORTED_COVER);

const placeLabelShape = { name: z.string(), countryCode: z.string().nullable().optional() };

/**
 * Title, place and cover shared by the new-trip form and the editor's details
 * dialog. A place carries `geonameId` only when freshly picked, so an
 * unchanged place isn't re-resolved.
 */
export const tripDetailsFormSchema = z.object({
  title: tripTitleSchema,
  city: z.object(
    { ...placeLabelShape, geonameId: z.number().optional() },
    { error: PLACE_REQUIRED },
  ),
  coverImage: coverImageSchema,
});

export type TripDetailsFormInput = z.input<typeof tripDetailsFormSchema>;

/** A place that was picked from the suggestions, so it can be sent to the server. */
export const pickedPlaceSchema = z.object(
  { ...placeLabelShape, ...tripCityInputSchema.shape },
  { error: PLACE_REQUIRED },
);

/** The picker's value for the form's place; `null` shows the empty input. */
export function toCityPickerValue(city: TripDetailsFormInput["city"] | null | undefined) {
  return city ? ({ name: city.name, countryCode: city.countryCode } satisfies CityPickerValue) : null;
}

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

/** Preview for the cover field; a rejected file never previews. */
export function useCoverPreviewUrl(cover: CoverValue): string | null {
  const file = cover instanceof File && isAcceptedCover(cover) ? cover : null;
  const fileUrl = useFilePreviewUrl(file);
  return typeof cover === "string" ? getTripImageUrl(cover) : fileUrl;
}
