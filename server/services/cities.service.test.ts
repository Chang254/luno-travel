import { searchCityRows } from "../resources/cities.resource";
import { searchCities } from "./cities.service";

jest.mock("../resources/cities.resource");

const supabase = {} as Parameters<typeof searchCities>[0];

const kyoto = {
  id: 1857910,
  name: "Kyoto",
  ascii_name: "Kyoto",
  country_code: "JP",
  country_name: "Japan",
  region_name: "Kyoto",
  latitude: 35.02107,
  longitude: 135.75385,
  population: 1459640,
};

describe("searchCities", () => {
  beforeEach(() => {
    jest.mocked(searchCityRows).mockResolvedValue([kyoto]);
  });

  it("maps matching cities to suggestions", async () => {
    const result = await searchCities(supabase, "kyo");

    expect(searchCityRows).toHaveBeenCalledWith(supabase, "kyo", null);
    expect(result).toEqual([
      { geonameId: 1857910, primaryText: "Kyoto", secondaryText: "Kyoto, Japan", countryCode: "JP" },
    ]);
  });

  it("leaves out the region when the city has none", async () => {
    jest.mocked(searchCityRows).mockResolvedValue([
      { ...kyoto, id: 226110, name: "Kyotera", country_code: "UG", country_name: "Uganda", region_name: null },
    ]);

    const [kyotera] = await searchCities(supabase, "kyotera");

    expect(kyotera.secondaryText).toBe("Uganda");
  });

  it("sends text after a comma as the qualifier", async () => {
    await searchCities(supabase, " portland ,  maine ");

    expect(searchCityRows).toHaveBeenCalledWith(supabase, "portland", "maine");
  });

  it("ignores an empty qualifier", async () => {
    await searchCities(supabase, "paris,");

    expect(searchCityRows).toHaveBeenCalledWith(supabase, "paris", null);
  });

  it("doesn't search without a name", async () => {
    await expect(searchCities(supabase, " , fr")).resolves.toEqual([]);
    expect(searchCityRows).not.toHaveBeenCalled();
  });
});
