import {
  findTripById,
  findTripsByOwnerId,
  insertTrip,
  updateTripContent,
  updateTripDetails,
  updateTripCover,
} from "@/server/resources/trips";
import {
  deletePublishedTrip,
  findPublishedTripById,
  upsertPublishedTrip,
} from "@/server/resources/publishedTrips";
import { removeImages } from "@/server/resources/tripImages";
import {
  createTripForUser,
  getPublicationForUser,
  getTripForUser,
  getTripsForUser,
  publishTripForUser,
  unpublishTripForUser,
  updateTripContentForUser,
  updateTripDetailsForUser,
  updateTripCoverForUser,
} from "./trips.service";

jest.mock("@/server/resources/trips");
jest.mock("@/server/resources/publishedTrips");
jest.mock("@/server/resources/tripImages");

const kyoto = {
  id: 1857910,
  name: "Kyoto",
  country_code: "JP",
  region_name: "Kyoto",
  latitude: 35.02107,
  longitude: 135.75385,
};

const trip = {
  id: "trip-1",
  owner_id: "user-1",
  title: "Kyoto",
  content: {},
  cover_image_url: null,
  city_id: 1857910,
  city: kyoto,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

describe("getTripsForUser", () => {
  it("returns the trips found for the given owner", async () => {
    const trips = [trip];
    jest.mocked(findTripsByOwnerId).mockResolvedValue(trips);

    const result = await getTripsForUser(
      {} as Parameters<typeof getTripsForUser>[0],
      "user-1",
    );

    expect(findTripsByOwnerId).toHaveBeenCalledWith({}, "user-1");
    expect(result).toEqual(trips);
  });
});

describe("getTripForUser", () => {
  it("returns the trip found for the given id and owner", async () => {
    jest.mocked(findTripById).mockResolvedValue(trip);

    const result = await getTripForUser(
      {} as Parameters<typeof getTripForUser>[0],
      "trip-1",
      "user-1",
    );

    expect(findTripById).toHaveBeenCalledWith({}, "trip-1", "user-1");
    expect(result).toEqual(trip);
  });

  it("returns null when no trip matches", async () => {
    jest.mocked(findTripById).mockResolvedValue(null);

    const result = await getTripForUser(
      {} as Parameters<typeof getTripForUser>[0],
      "trip-1",
      "user-1",
    );

    expect(result).toBeNull();
  });
});

const publishedTrip = {
  trip_id: "trip-1",
  owner_id: "user-1",
  title: "Kyoto",
  content: {},
  cover_image_url: null,
  city_id: null,
  city: null,
  author_name: "Ada Lovelace",
  author_avatar_url: "https://example.com/ada.png",
  published_at: "2026-01-02T00:00:00.000Z",
};

const author = { name: "Ada Lovelace", avatarUrl: "https://example.com/ada.png" };

function contentWithImages(...srcs: string[]) {
  return { root: { type: "root", children: srcs.map((src) => ({ type: "image", src })) } };
}

const supabase = {} as Parameters<typeof updateTripContentForUser>[0];

const cityInput = { geonameId: 1857910 };
const foreignKeyViolation = Object.assign(new Error("violates foreign key"), { code: "23503" });

describe("updateTripContentForUser", () => {
  beforeEach(() => {
    jest.mocked(findPublishedTripById).mockResolvedValue(null);
  });

  it("updates the trip's content for the given id and owner", async () => {
    jest.mocked(findTripById).mockResolvedValue(trip);
    const updatedTrip = { ...trip, content: { root: {} } };
    jest.mocked(updateTripContent).mockResolvedValue(updatedTrip);

    const result = await updateTripContentForUser(
      {} as Parameters<typeof updateTripContentForUser>[0],
      "trip-1",
      "user-1",
      { root: {} },
    );

    expect(updateTripContent).toHaveBeenCalledWith({}, "trip-1", "user-1", {
      root: {},
    });
    expect(result).toEqual(updatedTrip);
  });

  it("removes images from storage that the new content no longer references", async () => {
    jest
      .mocked(findTripById)
      .mockResolvedValue({ ...trip, content: contentWithImages("user-1/trip-1/a.png", "user-1/trip-1/b.png") });
    const next = contentWithImages("user-1/trip-1/b.png");
    jest.mocked(updateTripContent).mockResolvedValue({ ...trip, content: next });

    await updateTripContentForUser(supabase, "trip-1", "user-1", next);

    expect(removeImages).toHaveBeenCalledWith(supabase, ["user-1/trip-1/a.png"]);
  });

  it("keeps removed images that the published snapshot still shows", async () => {
    jest
      .mocked(findTripById)
      .mockResolvedValue({ ...trip, content: contentWithImages("user-1/trip-1/a.png", "user-1/trip-1/b.png") });
    const next = contentWithImages();
    jest.mocked(updateTripContent).mockResolvedValue({ ...trip, content: next });
    jest
      .mocked(findPublishedTripById)
      .mockResolvedValue({ ...publishedTrip, content: contentWithImages("user-1/trip-1/a.png") });

    await updateTripContentForUser(supabase, "trip-1", "user-1", next);

    expect(removeImages).toHaveBeenCalledWith(supabase, ["user-1/trip-1/b.png"]);
  });

  it("does not touch storage when no images were removed", async () => {
    const content = contentWithImages("user-1/trip-1/a.png");
    jest.mocked(findTripById).mockResolvedValue({ ...trip, content });
    jest.mocked(updateTripContent).mockResolvedValue({ ...trip, content });

    await updateTripContentForUser(supabase, "trip-1", "user-1", content);

    expect(removeImages).not.toHaveBeenCalled();
  });

  it("does not remove images when the save itself fails", async () => {
    jest
      .mocked(findTripById)
      .mockResolvedValue({ ...trip, content: contentWithImages("user-1/trip-1/a.png") });
    jest.mocked(updateTripContent).mockRejectedValue(new Error("db down"));

    await expect(
      updateTripContentForUser(supabase, "trip-1", "user-1", contentWithImages()),
    ).rejects.toThrow("db down");
    expect(removeImages).not.toHaveBeenCalled();
  });

  it("still returns the saved trip when storage cleanup fails", async () => {
    jest
      .mocked(findTripById)
      .mockResolvedValue({ ...trip, content: contentWithImages("user-1/trip-1/a.png") });
    const next = contentWithImages();
    const updatedTrip = { ...trip, content: next };
    jest.mocked(updateTripContent).mockResolvedValue(updatedTrip);
    jest.mocked(removeImages).mockRejectedValue(new Error("storage down"));
    jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(updateTripContentForUser(supabase, "trip-1", "user-1", next)).resolves.toEqual(
      updatedTrip,
    );
  });
});

describe("createTripForUser", () => {
  it("stores the picked city", async () => {
    jest.mocked(insertTrip).mockResolvedValue(trip);

    const result = await createTripForUser(supabase, "user-1", "Kyoto", cityInput);

    expect(insertTrip).toHaveBeenCalledWith(supabase, "user-1", "Kyoto", { city_id: 1857910 });
    expect(result).toEqual(trip);
  });

  it("rejects a city that isn't in the cities table", async () => {
    jest.mocked(insertTrip).mockRejectedValue(foreignKeyViolation);

    await expect(createTripForUser(supabase, "user-1", "Kyoto", cityInput)).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Unknown city",
    });
  });

  it("passes other database errors through", async () => {
    jest.mocked(insertTrip).mockRejectedValue(new Error("db down"));

    await expect(createTripForUser(supabase, "user-1", "Kyoto", cityInput)).rejects.toThrow(
      "db down",
    );
  });
});

describe("updateTripDetailsForUser", () => {
  const osakaInput = { geonameId: 1853909 };
  const tripWithCover = { ...trip, cover_image_url: "user-1/trip-1/old.png" };

  beforeEach(() => {
    jest.mocked(findTripById).mockResolvedValue(tripWithCover);
    jest.mocked(findPublishedTripById).mockResolvedValue(null);
  });

  it("saves just the title when nothing else changed", async () => {
    const updatedTrip = { ...tripWithCover, title: "Kansai" };
    jest.mocked(updateTripDetails).mockResolvedValue(updatedTrip);

    const result = await updateTripDetailsForUser(supabase, "trip-1", "user-1", { title: "Kansai" });

    expect(updateTripDetails).toHaveBeenCalledWith(supabase, "trip-1", "user-1", { title: "Kansai" });
    expect(removeImages).not.toHaveBeenCalled();
    expect(result).toEqual(updatedTrip);
  });

  it("stores a newly picked city", async () => {
    jest.mocked(updateTripDetails).mockResolvedValue(tripWithCover);

    await updateTripDetailsForUser(supabase, "trip-1", "user-1", { title: "Kyoto", city: osakaInput });

    expect(updateTripDetails).toHaveBeenCalledWith(supabase, "trip-1", "user-1", {
      title: "Kyoto",
      city_id: 1853909,
    });
  });

  it("replaces the cover and removes the old one from storage", async () => {
    jest
      .mocked(updateTripDetails)
      .mockResolvedValue({ ...trip, cover_image_url: "user-1/trip-1/new.png" });

    await updateTripDetailsForUser(supabase, "trip-1", "user-1", {
      title: "Kyoto",
      coverImagePath: "user-1/trip-1/new.png",
    });

    expect(updateTripDetails).toHaveBeenCalledWith(supabase, "trip-1", "user-1", {
      title: "Kyoto",
      cover_image_url: "user-1/trip-1/new.png",
    });
    expect(removeImages).toHaveBeenCalledWith(supabase, ["user-1/trip-1/old.png"]);
  });

  it("removes the cover", async () => {
    jest.mocked(updateTripDetails).mockResolvedValue(trip);

    await updateTripDetailsForUser(supabase, "trip-1", "user-1", {
      title: "Kyoto",
      coverImagePath: null,
    });

    expect(updateTripDetails).toHaveBeenCalledWith(supabase, "trip-1", "user-1", {
      title: "Kyoto",
      cover_image_url: null,
    });
    expect(removeImages).toHaveBeenCalledWith(supabase, ["user-1/trip-1/old.png"]);
  });

  it("keeps the old cover while the published snapshot still shows it", async () => {
    jest.mocked(updateTripDetails).mockResolvedValue(trip);
    jest
      .mocked(findPublishedTripById)
      .mockResolvedValue({ ...publishedTrip, cover_image_url: "user-1/trip-1/old.png" });

    await updateTripDetailsForUser(supabase, "trip-1", "user-1", {
      title: "Kyoto",
      coverImagePath: null,
    });

    expect(removeImages).not.toHaveBeenCalled();
  });

  it.each([
    ["another user's folder", "user-2/trip-1/cover.png"],
    ["a path that escapes the folder", "user-1/trip-1/../../user-2/trip-9/cover.png"],
  ])("rejects a cover in %s", async (_, path) => {
    await expect(
      updateTripDetailsForUser(supabase, "trip-1", "user-1", { title: "Kyoto", coverImagePath: path }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(updateTripDetails).not.toHaveBeenCalled();
  });
});

describe("updateTripCoverForUser", () => {
  it("sets the cover when the path is inside the trip's image folder", async () => {
    const updatedTrip = { ...trip, cover_image_url: "user-1/trip-1/cover.png" };
    jest.mocked(updateTripCover).mockResolvedValue(updatedTrip);

    const result = await updateTripCoverForUser(supabase, "trip-1", "user-1", "user-1/trip-1/cover.png");

    expect(updateTripCover).toHaveBeenCalledWith(supabase, "trip-1", "user-1", "user-1/trip-1/cover.png");
    expect(result).toEqual(updatedTrip);
  });

  it.each([
    ["another user's folder", "user-2/trip-1/cover.png"],
    ["another trip's folder", "user-1/trip-2/cover.png"],
    ["a path that escapes the folder", "user-1/trip-1/../../user-2/trip-9/cover.png"],
  ])("rejects a path in %s", async (_, path) => {
    await expect(updateTripCoverForUser(supabase, "trip-1", "user-1", path)).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    expect(updateTripCover).not.toHaveBeenCalled();
  });
});

describe("getPublicationForUser", () => {
  it("returns the snapshot when the user owns it", async () => {
    jest.mocked(findPublishedTripById).mockResolvedValue(publishedTrip);

    await expect(getPublicationForUser(supabase, "trip-1", "user-1")).resolves.toEqual(publishedTrip);
  });

  it("returns null for another user's published trip", async () => {
    jest.mocked(findPublishedTripById).mockResolvedValue(publishedTrip);

    await expect(getPublicationForUser(supabase, "trip-1", "user-2")).resolves.toBeNull();
  });
});

describe("publishTripForUser", () => {
  it("snapshots the saved draft's title, content, cover, city and author", async () => {
    const content = contentWithImages("user-1/trip-1/a.png");
    jest
      .mocked(findTripById)
      .mockResolvedValue({ ...trip, content, cover_image_url: "user-1/trip-1/cover.png" });
    jest.mocked(findPublishedTripById).mockResolvedValue(null);
    jest.mocked(upsertPublishedTrip).mockResolvedValue({ ...publishedTrip, content });

    const result = await publishTripForUser(supabase, "trip-1", "user-1", author);

    expect(upsertPublishedTrip).toHaveBeenCalledWith(supabase, {
      trip_id: "trip-1",
      owner_id: "user-1",
      title: "Kyoto",
      content,
      cover_image_url: "user-1/trip-1/cover.png",
      city_id: 1857910,
      author_name: "Ada Lovelace",
      author_avatar_url: "https://example.com/ada.png",
    });
    expect(result).toEqual({ ...publishedTrip, content });
    expect(removeImages).not.toHaveBeenCalled();
  });

  it("removes images only the previous snapshot referenced", async () => {
    jest
      .mocked(findTripById)
      .mockResolvedValue({ ...trip, content: contentWithImages("user-1/trip-1/b.png") });
    jest.mocked(findPublishedTripById).mockResolvedValue({
      ...publishedTrip,
      content: contentWithImages("user-1/trip-1/a.png", "user-1/trip-1/b.png"),
    });
    jest.mocked(upsertPublishedTrip).mockResolvedValue(publishedTrip);

    await publishTripForUser(supabase, "trip-1", "user-1", author);

    expect(removeImages).toHaveBeenCalledWith(supabase, ["user-1/trip-1/a.png"]);
  });

  it("removes the previous snapshot's cover once the draft no longer uses it", async () => {
    jest
      .mocked(findTripById)
      .mockResolvedValue({ ...trip, cover_image_url: "user-1/trip-1/new.png" });
    jest
      .mocked(findPublishedTripById)
      .mockResolvedValue({ ...publishedTrip, cover_image_url: "user-1/trip-1/old.png" });
    jest.mocked(upsertPublishedTrip).mockResolvedValue(publishedTrip);

    await publishTripForUser(supabase, "trip-1", "user-1", author);

    expect(removeImages).toHaveBeenCalledWith(supabase, ["user-1/trip-1/old.png"]);
  });

  it("keeps the cover when the draft still uses it", async () => {
    const cover = "user-1/trip-1/cover.png";
    jest.mocked(findTripById).mockResolvedValue({ ...trip, cover_image_url: cover });
    jest.mocked(findPublishedTripById).mockResolvedValue({ ...publishedTrip, cover_image_url: cover });
    jest.mocked(upsertPublishedTrip).mockResolvedValue(publishedTrip);

    await publishTripForUser(supabase, "trip-1", "user-1", author);

    expect(removeImages).not.toHaveBeenCalled();
  });

  it("rejects a trip the user doesn't own", async () => {
    jest.mocked(findTripById).mockResolvedValue(null);

    await expect(publishTripForUser(supabase, "trip-1", "user-2", author)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    expect(upsertPublishedTrip).not.toHaveBeenCalled();
  });
});

describe("unpublishTripForUser", () => {
  it("deletes the snapshot and the images only it referenced", async () => {
    jest.mocked(findPublishedTripById).mockResolvedValue({
      ...publishedTrip,
      content: contentWithImages("user-1/trip-1/a.png", "user-1/trip-1/b.png"),
    });
    jest
      .mocked(findTripById)
      .mockResolvedValue({ ...trip, content: contentWithImages("user-1/trip-1/b.png") });

    await unpublishTripForUser(supabase, "trip-1", "user-1");

    expect(deletePublishedTrip).toHaveBeenCalledWith(supabase, "trip-1", "user-1");
    expect(removeImages).toHaveBeenCalledWith(supabase, ["user-1/trip-1/a.png"]);
  });

  it("removes a cover only the snapshot used", async () => {
    jest
      .mocked(findPublishedTripById)
      .mockResolvedValue({ ...publishedTrip, cover_image_url: "user-1/trip-1/old.png" });
    jest.mocked(findTripById).mockResolvedValue({ ...trip, cover_image_url: null });

    await unpublishTripForUser(supabase, "trip-1", "user-1");

    expect(removeImages).toHaveBeenCalledWith(supabase, ["user-1/trip-1/old.png"]);
  });

  it("keeps the cover when the draft still uses it", async () => {
    const cover = "user-1/trip-1/cover.png";
    jest.mocked(findPublishedTripById).mockResolvedValue({ ...publishedTrip, cover_image_url: cover });
    jest.mocked(findTripById).mockResolvedValue({ ...trip, cover_image_url: cover });

    await unpublishTripForUser(supabase, "trip-1", "user-1");

    expect(removeImages).not.toHaveBeenCalled();
  });

  it("does not touch storage when the trip wasn't published", async () => {
    jest.mocked(findPublishedTripById).mockResolvedValue(null);
    jest.mocked(findTripById).mockResolvedValue(trip);

    await unpublishTripForUser(supabase, "trip-1", "user-1");

    expect(removeImages).not.toHaveBeenCalled();
  });
});
