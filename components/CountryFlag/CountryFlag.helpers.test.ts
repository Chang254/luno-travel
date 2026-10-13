import { getCountryName, getFlagUrl } from "./CountryFlag.helpers";

describe("getFlagUrl", () => {
  it("points at the uppercase flag route", () => {
    expect(getFlagUrl("jp")).toBe("/flags/JP.svg");
  });
});

describe("getCountryName", () => {
  it("returns the English country name", () => {
    expect(getCountryName("JP")).toBe("Japan");
    expect(getCountryName("pt")).toBe("Portugal");
  });

  it("falls back to the code for malformed input", () => {
    expect(getCountryName("123")).toBe("123");
  });
});
