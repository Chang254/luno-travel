import type { GeoNamesCity } from "../models/cities.types";
import { loadCities } from "../resources/cities.resource";
import { getCityDetails, normalizeCityText, searchCities } from "./cities.service";

jest.mock("../resources/cities.resource");

const cities: GeoNamesCity[] = [
  [5128581, "New York City", "", "US", "New York", 40.71427, -74.00597, 8804190],
  [3448439, "São Paulo", "Sao Paulo", "BR", "São Paulo", -23.5475, -46.63611, 12400232],
  [2988507, "Paris", "", "FR", "Île-de-France", 48.85341, 2.3488, 2138551],
  [1857910, "Kyoto", "", "JP", "Kyoto", 35.02107, 135.75385, 1459640],
  [4720131, "Portland", "", "US", "Oregon", 45.52345, -122.67621, 652503],
  [2633352, "York", "", "GB", "England", 53.95763, -1.08271, 153717],
  [5083330, "Portland", "", "US", "Maine", 43.66147, -70.25533, 68408],
  [4717560, "Paris", "", "US", "Texas", 33.66094, -95.55551, 24782],
  [226110, "Kyotera", "", "UG", "", -0.6155, 31.5175, 13000],
];

describe("normalizeCityText", () => {
  it("drops case, accents and punctuation", () => {
    expect(normalizeCityText("  Île-de-France ")).toBe("ile de france");
  });
});

describe("searchCities", () => {
  beforeEach(() => {
    jest.mocked(loadCities).mockResolvedValue(cities);
  });

  it("puts exact names first, then larger cities", async () => {
    const result = await searchCities("paris");

    expect(result).toEqual([
      { geonameId: 2988507, primaryText: "Paris", secondaryText: "Île-de-France, France", countryCode: "FR" },
      { geonameId: 4717560, primaryText: "Paris", secondaryText: "Texas, United States", countryCode: "US" },
    ]);
  });

  it("ranks an exact name above a longer one, and a name prefix above a later word", async () => {
    const result = await searchCities("york");

    expect(result.map(({ primaryText }) => primaryText)).toEqual(["York", "New York City"]);
  });

  it("matches prefixes without accents", async () => {
    const result = await searchCities("sao pa");

    expect(result).toEqual([
      { geonameId: 3448439, primaryText: "São Paulo", secondaryText: "São Paulo, Brazil", countryCode: "BR" },
    ]);
  });

  it("orders prefix matches by population", async () => {
    const result = await searchCities("kyo");

    expect(result.map(({ primaryText }) => primaryText)).toEqual(["Kyoto", "Kyotera"]);
  });

  it("leaves out the region when GeoNames has none", async () => {
    const [kyotera] = await searchCities("kyotera");

    expect(kyotera.secondaryText).toBe("Uganda");
  });

  it.each([
    ["region", "portland, maine", 5083330],
    ["country code", "paris, us", 4717560],
    ["country name", "york, united k", 2633352],
  ])("narrows by %s after a comma", async (_, query, geonameId) => {
    const result = await searchCities(query);

    expect(result.map((city) => city.geonameId)).toEqual([geonameId]);
  });

  it("returns nothing for punctuation alone", async () => {
    await expect(searchCities("--")).resolves.toEqual([]);
  });

  it("returns at most eight suggestions", async () => {
    const manyCities = Array.from(
      { length: 20 },
      (_, i): GeoNamesCity => [i + 1, `Springfield ${i}`, "", "US", "", 0, 0, 1000 - i],
    );
    jest.mocked(loadCities).mockResolvedValue(manyCities);

    await expect(searchCities("springfield")).resolves.toHaveLength(8);
  });
});

describe("getCityDetails", () => {
  beforeEach(() => {
    jest.mocked(loadCities).mockResolvedValue(cities);
  });

  it("returns the city's name, country code and coordinates", async () => {
    await expect(getCityDetails(1857910)).resolves.toEqual({
      name: "Kyoto",
      countryCode: "JP",
      latitude: 35.02107,
      longitude: 135.75385,
    });
  });

  it("rejects an unknown id", async () => {
    await expect(getCityDetails(42)).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
