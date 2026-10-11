import {
  findTripById,
  findTripsByOwnerId,
  updateTripContent,
} from "../resources/trips.resource";
import {
  getTripForUser,
  getTripsForUser,
  updateTripContentForUser,
} from "./trips.service";

jest.mock("../resources/trips.resource");

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

describe("updateTripContentForUser", () => {
  it("updates the trip's content for the given id and owner", async () => {
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
});
