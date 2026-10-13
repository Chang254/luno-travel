import { createSignedImageUpload } from "../resources/tripImages.resource";
import { findTripById } from "../resources/trips.resource";
import {
  createImageUploadForUser,
  extractImagePaths,
  getRemovedCoverPaths,
  getRemovedImagePaths,
} from "./tripImages.service";

jest.mock("../resources/tripImages.resource");
jest.mock("../resources/trips.resource");

const supabase = {} as Parameters<typeof createImageUploadForUser>[0];

const trip = {
  id: "trip-1",
  owner_id: "user-1",
  title: "Kyoto",
  content: {},
  cover_image_url: null,
  city_name: "Kyoto",
  city_country_code: "JP",
  city_latitude: 35.02107,
  city_longitude: 135.75385,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

function contentWithImages(...srcs: string[]) {
  return {
    root: {
      type: "root",
      children: [
        { type: "paragraph", children: [{ type: "text", text: "hi" }] },
        ...srcs.map((src) => ({ type: "image", src, alt: "", width: 400 })),
      ],
    },
  };
}

describe("createImageUploadForUser", () => {
  it("returns a signed upload for a path inside the user's trip folder", async () => {
    jest.mocked(findTripById).mockResolvedValue(trip);
    jest
      .mocked(createSignedImageUpload)
      .mockImplementation(async (_supabase, path) => ({ path, token: "token" }));

    const result = await createImageUploadForUser(supabase, "trip-1", "user-1", "image/jpeg");

    expect(findTripById).toHaveBeenCalledWith(supabase, "trip-1", "user-1");
    expect(result.path).toMatch(/^user-1\/trip-1\/[0-9a-f-]{36}\.jpg$/);
    expect(result.token).toBe("token");
  });

  it("rejects when the user does not own the trip", async () => {
    jest.mocked(findTripById).mockResolvedValue(null);

    await expect(
      createImageUploadForUser(supabase, "trip-1", "user-2", "image/png"),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(createSignedImageUpload).not.toHaveBeenCalled();
  });
});

describe("extractImagePaths", () => {
  it("collects image srcs at any depth and ignores other nodes", () => {
    const content = contentWithImages("user-1/trip-1/a.png");
    (content.root.children[0] as { children: unknown[] }).children.push({
      type: "image",
      src: "user-1/trip-1/nested.png",
    });

    expect(extractImagePaths(content)).toEqual(
      new Set(["user-1/trip-1/a.png", "user-1/trip-1/nested.png"]),
    );
  });

  it("returns an empty set for empty or missing content", () => {
    expect(extractImagePaths({}).size).toBe(0);
    expect(extractImagePaths(undefined).size).toBe(0);
  });
});

describe("getRemovedImagePaths", () => {
  it("keeps paths still referenced by retained content", () => {
    const removed = getRemovedImagePaths(
      contentWithImages("user-1/trip-1/a.png", "user-1/trip-1/b.png"),
      contentWithImages(),
      "user-1",
      "trip-1",
      [contentWithImages("user-1/trip-1/a.png"), undefined],
    );

    expect(removed).toEqual(["user-1/trip-1/b.png"]);
  });

  it("returns paths present before but not after", () => {
    const removed = getRemovedImagePaths(
      contentWithImages("user-1/trip-1/a.png", "user-1/trip-1/b.png"),
      contentWithImages("user-1/trip-1/b.png"),
      "user-1",
      "trip-1",
    );

    expect(removed).toEqual(["user-1/trip-1/a.png"]);
  });

  it("never returns paths outside the user's trip folder", () => {
    const removed = getRemovedImagePaths(
      contentWithImages(
        "user-2/trip-9/theirs.png",
        "user-1/trip-2/other-trip.png",
        "user-1/trip-1/../../user-2/trip-9/theirs.png",
      ),
      contentWithImages(),
      "user-1",
      "trip-1",
    );

    expect(removed).toEqual([]);
  });
});

describe("getRemovedCoverPaths", () => {
  it("returns the previous cover when nothing retained still uses it", () => {
    expect(
      getRemovedCoverPaths("user-1/trip-1/old.png", "user-1", "trip-1", ["user-1/trip-1/new.png"]),
    ).toEqual(["user-1/trip-1/old.png"]);
  });

  it("keeps a cover that's still retained", () => {
    expect(
      getRemovedCoverPaths("user-1/trip-1/old.png", "user-1", "trip-1", ["user-1/trip-1/old.png"]),
    ).toEqual([]);
  });

  it("returns nothing when there was no cover", () => {
    expect(getRemovedCoverPaths(null, "user-1", "trip-1", [])).toEqual([]);
  });

  it.each([
    ["another user's folder", "user-2/trip-1/old.png"],
    ["a path that escapes the folder", "user-1/trip-1/../../user-2/trip-9/old.png"],
  ])("never returns a cover in %s", (_, path) => {
    expect(getRemovedCoverPaths(path, "user-1", "trip-1", [])).toEqual([]);
  });
});
