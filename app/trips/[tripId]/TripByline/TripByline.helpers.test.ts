import { formatPublishedDate } from "./TripByline.helpers";

describe("formatPublishedDate", () => {
  it("formats the publish date in long form", () => {
    expect(formatPublishedDate("2026-10-12T18:30:00.000Z")).toBe("October 12, 2026");
  });

  it("uses the UTC date so every reader sees the same day", () => {
    expect(formatPublishedDate("2026-10-12T23:59:00.000Z")).toBe("October 12, 2026");
  });
});
