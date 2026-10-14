import type { Trip } from "@/server/models/trips.types";

/** Folder every image for a trip lives under; also scopes which paths a save may delete. */
export function getTripImageFolder(ownerId: string, tripId: string): string {
  return `${ownerId}/${tripId}/`;
}

/** Whether `path` sits inside this trip's folder, so crafted input can't target other users' or trips' objects. */
export function isTripImagePath(path: string, ownerId: string, tripId: string): boolean {
  return path.startsWith(getTripImageFolder(ownerId, tripId)) && !path.includes("..");
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
 * content, e.g. the published snapshot), limited to this trip's folder.
 */
export function getRemovedImagePaths(
  previous: Trip["content"] | undefined,
  next: Trip["content"],
  ownerId: string,
  tripId: string,
  retained: (Trip["content"] | undefined)[] = [],
): string[] {
  const keptPaths = new Set(
    [next, ...retained].flatMap((content) => [...extractImagePaths(content)]),
  );

  return [...extractImagePaths(previous)].filter(
    (path) => isTripImagePath(path, ownerId, tripId) && !keptPaths.has(path),
  );
}

/**
 * The previous cover's path when nothing in `retained` (the draft's or the
 * published snapshot's cover) still uses it, limited to this trip's folder.
 */
export function getRemovedCoverPaths(
  previous: string | null | undefined,
  ownerId: string,
  tripId: string,
  retained: (string | null | undefined)[],
): string[] {
  if (!previous || !isTripImagePath(previous, ownerId, tripId)) return [];
  return retained.includes(previous) ? [] : [previous];
}
