import { createSignedImageUpload } from "@/server/resources/tripImages";
import { findTripById } from "@/server/resources/trips";
import { createImageUploadForUser } from "./tripImages.service";

jest.mock("@/server/resources/tripImages");
jest.mock("@/server/resources/trips");

const supabase = {} as Parameters<typeof createImageUploadForUser>[0];

const trip = {
  id: "trip-1",
  owner_id: "user-1",
  title: "Kyoto",
  content: {},
  cover_image_url: null,
  city_id: 1857910,
  city: {
    id: 1857910,
    name: "Kyoto",
    country_code: "JP",
    region_name: "Kyoto",
    latitude: 35.02107,
    longitude: 135.75385,
  },
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

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
