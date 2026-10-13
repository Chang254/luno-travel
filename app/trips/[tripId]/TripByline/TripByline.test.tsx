import { render, screen } from "@/lib/test-utils";

import TripByline from "./TripByline";

const author = { name: "Ada Lovelace", avatarUrl: null };

describe("TripByline", () => {
  it("shows the author, place and publish date", () => {
    render(
      <TripByline
        author={author}
        cityName="Kyoto"
        cityCountryCode="JP"
        publishedAt="2026-10-12T18:30:00.000Z"
      />,
    );

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("AL")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Japan" })).toBeInTheDocument();
    expect(screen.getByText("Published")).toHaveTextContent("Published October 12, 2026");
    expect(screen.getByText("October 12, 2026")).toHaveAttribute("datetime", "2026-10-12T18:30:00.000Z");
  });

  it("says when a draft hasn't been published yet", () => {
    render(<TripByline author={author} cityName="Kyoto" cityCountryCode="JP" publishedAt={null} />);

    expect(screen.getByText("Not published yet")).toBeInTheDocument();
    expect(screen.queryByText(/Published/)).not.toBeInTheDocument();
  });

  it("leaves out the author when there isn't one", () => {
    render(<TripByline cityName="Kyoto" cityCountryCode="JP" publishedAt={null} />);

    expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();
    expect(screen.getAllByText("·")).toHaveLength(1);
  });
});
