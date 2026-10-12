import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useCreateTrip } from "@/lib/api/trips";
import { IMAGE_EXTENSIONS } from "@/server/models/tripImages.types";

export const ACCEPTED_COVER_TYPES = Object.keys(IMAGE_EXTENSIONS).join(",");

export function isAllowedCoverType(file: File): boolean {
  return file.type in IMAGE_EXTENSIONS;
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

/** State and submit flow for the new-trip form; navigates to the editor once the trip is created. */
export function useNewTripForm() {
  const router = useRouter();
  const createTrip = useCreateTrip();
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  /** Bumped to remount the file input, since a file input's value can't be cleared through props. */
  const [coverInputKey, setCoverInputKey] = useState(0);
  const coverPreviewUrl = useFilePreviewUrl(coverImage);

  function selectCover(file: File | undefined) {
    if (!file) return;
    if (!isAllowedCoverType(file)) {
      setCoverImage(null);
      setCoverError("Choose a JPEG, PNG, GIF, WebP, or AVIF image.");
      setCoverInputKey((key) => key + 1);
      return;
    }
    setCoverError(null);
    setCoverImage(file);
  }

  function removeCover() {
    setCoverImage(null);
    setCoverError(null);
    setCoverInputKey((key) => key + 1);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createTrip.mutate(
      { title: title.trim(), coverImage },
      { onSuccess: (trip) => router.push(`/editor/${trip.id}`) },
    );
  }

  return {
    title,
    setTitle,
    coverImage,
    coverError,
    coverInputKey,
    coverPreviewUrl,
    selectCover,
    removeCover,
    submit,
    canSubmit: title.trim().length > 0 && !createTrip.isPending,
    isPending: createTrip.isPending,
    isError: createTrip.isError,
  };
}
