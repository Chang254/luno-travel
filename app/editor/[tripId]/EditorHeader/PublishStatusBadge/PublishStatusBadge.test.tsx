import { render, screen } from "@/lib/test-utils";
import { usePublication } from "@/lib/api/trips";

import PublishStatusBadge from "./PublishStatusBadge";

jest.mock("@/lib/api/trips");

function mockPublication(data: unknown) {
  jest.mocked(usePublication).mockReturnValue({ data } as unknown as ReturnType<
    typeof usePublication
  >);
}

describe("PublishStatusBadge", () => {
  it("shows Draft for a trip that isn't published", () => {
    mockPublication(null);

    render(<PublishStatusBadge tripId="trip-1" initiallyPublished />);

    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("shows Published for a published trip", () => {
    mockPublication({ trip_id: "trip-1" });

    render(<PublishStatusBadge tripId="trip-1" initiallyPublished={false} />);

    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("uses the server-loaded status until the publication query resolves", () => {
    mockPublication(undefined);

    render(<PublishStatusBadge tripId="trip-1" initiallyPublished />);

    expect(screen.getByText("Published")).toBeInTheDocument();
  });
});
