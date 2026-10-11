import { z } from "zod";

/** Allowed upload types mapped to the extension used in the object path. SVG is excluded since the bucket is public. */
export const IMAGE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

export type ImageContentType = keyof typeof IMAGE_EXTENSIONS;

export const createImageUploadInputSchema = z.object({
  tripId: z.string(),
  contentType: z.enum(Object.keys(IMAGE_EXTENSIONS) as [ImageContentType, ...ImageContentType[]]),
});

export interface SignedImageUpload {
  /** Object path within the trip images bucket; this is what the editor stores as the image `src`. */
  path: string;
  token: string;
}
