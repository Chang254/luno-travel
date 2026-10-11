import { findTripsByOwnerId } from "../resources/trips.resource";
import { getTripsForUser } from "./trips.service";

jest.mock("../resources/trips.resource");

describe("getTripsForUser", () => {
  it("returns the trips found for the given owner", async () => {
    const trips = [
      {
        id: "trip-1",
        owner_id: "user-1",
        title: "Kyoto",
        content: {},
        cover_image_url: null,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ];
    jest.mocked(findTripsByOwnerId).mockResolvedValue(trips);

    const result = await getTripsForUser(
      {} as Parameters<typeof getTripsForUser>[0],
      "user-1",
    );

    expect(findTripsByOwnerId).toHaveBeenCalledWith({}, "user-1");
    expect(result).toEqual(trips);
  });
});
