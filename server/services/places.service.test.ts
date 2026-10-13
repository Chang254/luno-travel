import { autocompleteCities, fetchPlaceDetails } from "../resources/places.resource";
import { getCityDetails, searchCities } from "./places.service";

jest.mock("../resources/places.resource");

const sessionToken = "6f1c1b7e-4d2a-4c8e-9a51-2f3b4c5d6e7f";

describe("searchCities", () => {
  it("maps Google predictions to suggestions", async () => {
    jest.mocked(autocompleteCities).mockResolvedValue({
      suggestions: [
        {
          placePrediction: {
            placeId: "place-kyoto",
            text: { text: "Kyoto, Japan" },
            structuredFormat: { mainText: { text: "Kyoto" }, secondaryText: { text: "Japan" } },
          },
        },
        { placePrediction: { placeId: "place-kyotera", text: { text: "Kyotera, Uganda" } } },
        {},
      ],
    });

    const result = await searchCities("kyot", sessionToken);

    expect(autocompleteCities).toHaveBeenCalledWith("kyot", sessionToken);
    expect(result).toEqual([
      { placeId: "place-kyoto", primaryText: "Kyoto", secondaryText: "Japan" },
      { placeId: "place-kyotera", primaryText: "Kyotera, Uganda", secondaryText: "" },
    ]);
  });

  it("returns no suggestions when Google has none", async () => {
    jest.mocked(autocompleteCities).mockResolvedValue({});

    await expect(searchCities("zzzz", sessionToken)).resolves.toEqual([]);
  });
});

describe("getCityDetails", () => {
  it("returns the city's name and ISO country code", async () => {
    jest.mocked(fetchPlaceDetails).mockResolvedValue({
      id: "place-kyoto",
      displayName: { text: "Kyoto" },
      addressComponents: [
        { longText: "Kyoto", shortText: "Kyoto", types: ["locality", "political"] },
        { longText: "Japan", shortText: "jp", types: ["country", "political"] },
      ],
    });

    await expect(getCityDetails("place-kyoto", sessionToken)).resolves.toEqual({
      placeId: "place-kyoto",
      name: "Kyoto",
      countryCode: "JP",
    });
    expect(fetchPlaceDetails).toHaveBeenCalledWith("place-kyoto", sessionToken);
  });

  it("rejects a place without a country", async () => {
    jest.mocked(fetchPlaceDetails).mockResolvedValue({
      id: "place-sea",
      displayName: { text: "Somewhere at sea" },
      addressComponents: [],
    });

    await expect(getCityDetails("place-sea", sessionToken)).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });
});
