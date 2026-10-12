import { TRPCError } from "@trpc/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  IMAGE_EXTENSIONS,
  type ImageContentType,
  type SignedImageUpload,
} from "@/server/models/tripImages.types";
import type { Trip } from "@/server/models/trips.types";
import { createSignedImageUpload } from "@/server/resources/tripImages.resource";
import { findTripById } from "@/server/resources/trips.resource";

/** Folder every image for a trip lives under; also scopes which paths a save may delete. */
export function getTripImageFolder(ownerId: string, tripId: string): string {
  return `${ownerId}/${tripId}/`;
}

export async function createImageUploadForUser(
  supabase: SupabaseClient<Database>,
  tripId: string,
  ownerId: string,
  contentType: ImageContentType,
): Promise<SignedImageUpload> {
  const trip = await findTripById(supabase, tripId, ownerId);
  if (!trip) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  const path = `${getTripImageFolder(ownerId, tripId)}${crypto.randomUUID()}.${IMAGE_EXTENSIONS[contentType]}`;
  return createSignedImageUpload(supabase, path);
}

/** Collects the `src` of every `image` node anywhere in serialized Lexical content. */
export function extractImagePaths(content: Trip["content"] | undefined): Set<string> {
  const paths = new Set<string>();

  function visit(value: unknown) {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (value === null || typeof value !== "object") return;

    const node = value as Record<string, unknown>;
    if (node.type === "image" && typeof node.src === "string" && node.src) {
      paths.add(node.src);
    }
    Object.values(node).forEach(visit);
  }

  visit(content);
  return paths;
}

/**
 * Image paths referenced by `previous` but not `next` (nor any `retained`
 * content, e.g. the published snapshot), limited to this trip's folder so
 * crafted content can't target other users' or trips' objects.
 */
export function getRemovedImagePaths(
  previous: Trip["content"] | undefined,
  next: Trip["content"],
  ownerId: string,
  tripId: string,
  retained: (Trip["content"] | undefined)[] = [],
): string[] {
  const folder = getTripImageFolder(ownerId, tripId);
  const keptPaths = new Set(
    [next, ...retained].flatMap((content) => [...extractImagePaths(content)]),
  );

  return [...extractImagePaths(previous)].filter(
    (path) => path.startsWith(folder) && !path.includes("..") && !keptPaths.has(path),
  );
}
