import { clampRatio, hexToHsv, hsvToHex, normalizeHex } from "./ColorPicker.helpers";

describe("normalizeHex", () => {
  it("expands a 3-digit hex to 6 digits and lowercases it", () => {
    expect(normalizeHex("#F0A")).toBe("#ff00aa");
  });

  it("adds a leading # when missing", () => {
    expect(normalizeHex("1971c2")).toBe("#1971c2");
  });

  it("returns null for invalid input", () => {
    expect(normalizeHex("not-a-color")).toBeNull();
  });
});

describe("hexToHsv / hsvToHex", () => {
  it("round-trips pure red", () => {
    expect(hsvToHex(hexToHsv("#ff0000"))).toBe("#ff0000");
  });

  it("round-trips an arbitrary color", () => {
    expect(hsvToHex(hexToHsv("#1971c2"))).toBe("#1971c2");
  });

  it("maps black to zero value", () => {
    expect(hexToHsv("#000000")).toEqual({ h: 0, s: 0, v: 0 });
  });

  it("maps white to zero saturation and full value", () => {
    expect(hexToHsv("#ffffff")).toEqual({ h: 0, s: 0, v: 1 });
  });
});

describe("clampRatio", () => {
  it("clamps values below 0", () => {
    expect(clampRatio(-0.5)).toBe(0);
  });

  it("clamps values above 1", () => {
    expect(clampRatio(1.5)).toBe(1);
  });

  it("passes through in-range values", () => {
    expect(clampRatio(0.42)).toBe(0.42);
  });
});
