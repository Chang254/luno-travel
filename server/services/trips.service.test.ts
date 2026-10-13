import {
  findTripById,
  findTripsByOwnerId,
  insertTrip,
  updateTripCity,
  updateTripContent,
  updateTripCover,
} from "../resources/trips.resource";
import {
  deletePublishedTrip,
  findPublishedTripById,
  upsertPublishedTrip,
} from "../resources/publishedTrips.resource";
import { removeImages } from "../resources/tripImages.resource";
import { getCityDetails } from "./places.service";
import {
  createTripForUser,
  getPublicationForUser,
  getTripForUser,
  getTripsForUser,
  publishTripForUser,
  unpublishTripForUser,
  updateTripCityForUser,
  updateTripContentForUser,
  updateTripCoverForUser,
} from "./trips.service";

jest.mock("../resources/trips.resource");
jest.mock("../resources/publishedTrips.resource");
jest.mock("../resources/tripImages.resource");
jest.mock("./places.service");

const trip = {
  id: "trip-1",
  owner_id: "user-1",
  title: "Kyoto",
  content: {},
  cover_image_url: null,
  city_place_id: null,
  city_name: null,
  city_country_code: null,
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
  city_place_id: null,
  city_name: null,
  city_country_code: null,
  author_name: "Ada Lovelace",
  author_avatar_url: "https://example.com/ada.png",
  published_at: "2026-01-02T00:00:00.000Z",
};

const author = { name: "Ada Lovelace", avatarUrl: "https://example.com/ada.png" };

function contentWithImages(...srcs: string[]) {
  return { root: { type: "root", children: srcs.map((src) => ({ type: "image", src })) } };
}

const supabase = {} as Parameters<typeof updateTripContentForUser>[0];

const sessionToken = "6f1c1b7e-4d2a-4c8e-9a51-2f3b4c5d6e7f";
const cityInput = { placeId: "place-kyoto", sessionToken };
const kyoto = { placeId: "place-kyoto", name: "Kyoto", countryCode: "JP" };
const kyotoColumns = { city_place_id: "place-kyoto", city_name: "Kyoto", city_country_code: "JP" };

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
  it("inserts a trip owned by the given user with the given title", async () => {
    jest.mocked(insertTrip).mockResolvedValue(trip);

    const result = await createTripForUser(supabase, "user-1", "Kyoto");

    expect(insertTrip).toHaveBeenCalledWith(supabase, "user-1", "Kyoto");
    expect(result).toEqual(trip);
  });

  it("stores the city Google resolves for the picked place", async () => {
    jest.mocked(getCityDetails).mockResolvedValue(kyoto);
    jest.mocked(insertTrip).mockResolvedValue({ ...trip, ...kyotoColumns });

    await createTripForUser(supabase, "user-1", "Kyoto", cityInput);

    expect(getCityDetails).toHaveBeenCalledWith("place-kyoto", sessionToken);
    expect(insertTrip).toHaveBeenCalledWith(supabase, "user-1", "Kyoto", kyotoColumns);
  });

  it("doesn't create the trip when the city can't be resolved", async () => {
    jest.mocked(getCityDetails).mockRejectedValue(new Error("Places down"));

    await expect(createTripForUser(supabase, "user-1", "Kyoto", cityInput)).rejects.toThrow(
      "Places down",
    );
    expect(insertTrip).not.toHaveBeenCalled();
  });
});

describe("updateTripCityForUser", () => {
  it("sets the city Google resolves for the picked place", async () => {
    jest.mocked(getCityDetails).mockResolvedValue(kyoto);
    const updatedTrip = { ...trip, ...kyotoColumns };
    jest.mocked(updateTripCity).mockResolvedValue(updatedTrip);

    const result = await updateTripCityForUser(supabase, "trip-1", "user-1", cityInput);

    expect(updateTripCity).toHaveBeenCalledWith(supabase, "trip-1", "user-1", kyotoColumns);
    expect(result).toEqual(updatedTrip);
  });

  it("clears the city without calling Google", async () => {
    jest.mocked(updateTripCity).mockResolvedValue(trip);

    await updateTripCityForUser(supabase, "trip-1", "user-1", null);

    expect(getCityDetails).not.toHaveBeenCalled();
    expect(updateTripCity).toHaveBeenCalledWith(supabase, "trip-1", "user-1", {
      city_place_id: null,
      city_name: null,
      city_country_code: null,
    });
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
      .mockResolvedValue({ ...trip, ...kyotoColumns, content, cover_image_url: "user-1/trip-1/cover.png" });
    jest.mocked(findPublishedTripById).mockResolvedValue(null);
    jest.mocked(upsertPublishedTrip).mockResolvedValue({ ...publishedTrip, content });

    const result = await publishTripForUser(supabase, "trip-1", "user-1", author);

    expect(upsertPublishedTrip).toHaveBeenCalledWith(supabase, {
      trip_id: "trip-1",
      owner_id: "user-1",
      title: "Kyoto",
      content,
      cover_image_url: "user-1/trip-1/cover.png",
      ...kyotoColumns,
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

  it("does not touch storage when the trip wasn't published", async () => {
    jest.mocked(findPublishedTripById).mockResolvedValue(null);
    jest.mocked(findTripById).mockResolvedValue(trip);

    await unpublishTripForUser(supabase, "trip-1", "user-1");

    expect(removeImages).not.toHaveBeenCalled();
  });
});
