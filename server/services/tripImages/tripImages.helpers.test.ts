import { extractImagePaths, getRemovedCoverPaths, getRemovedImagePaths } from "./tripImages.helpers";

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
