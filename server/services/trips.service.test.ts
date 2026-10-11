import {
  findTripById,
  findTripsByOwnerId,
  updateTripContent,
} from "../resources/trips.resource";
import { removeImages } from "../resources/tripImages.resource";
import {
  getTripForUser,
  getTripsForUser,
  updateTripContentForUser,
} from "./trips.service";

jest.mock("../resources/trips.resource");
jest.mock("../resources/tripImages.resource");

const trip = {
  id: "trip-1",
  owner_id: "user-1",
  title: "Kyoto",
  content: {},
  cover_image_url: null,
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

function contentWithImages(...srcs: string[]) {
  return { root: { type: "root", children: srcs.map((src) => ({ type: "image", src })) } };
}

const supabase = {} as Parameters<typeof updateTripContentForUser>[0];

describe("updateTripContentForUser", () => {
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
