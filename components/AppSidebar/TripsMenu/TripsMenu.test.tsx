import { render, screen } from "@testing-library/react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { useTrips } from "../../../lib/api/trips";
import TripsMenu from "./TripsMenu";

jest.mock("../../../lib/api/trips");

function renderTripsMenu() {
  return render(
    <SidebarProvider>
      <TripsMenu />
    </SidebarProvider>,
  );
}

describe("TripsMenu", () => {
  it("shows a loading state while trips are pending", () => {
    jest.mocked(useTrips).mockReturnValue({
      isPending: true,
      isError: false,
      data: undefined,
    } as unknown as ReturnType<typeof useTrips>);

    renderTripsMenu();

    expect(screen.getByText("Loading trips…")).toBeInTheDocument();
  });

  it("shows an error state when the query fails", () => {
    jest.mocked(useTrips).mockReturnValue({
      isPending: false,
      isError: true,
      data: undefined,
    } as unknown as ReturnType<typeof useTrips>);

    renderTripsMenu();

    expect(screen.getByText("Couldn't load trips")).toBeInTheDocument();
  });

  it("shows an empty state when there are no trips", () => {
    jest.mocked(useTrips).mockReturnValue({
      isPending: false,
      isError: false,
      data: [],
    } as unknown as ReturnType<typeof useTrips>);

    renderTripsMenu();

    expect(screen.getByText("No trips yet")).toBeInTheDocument();
  });

  it("lists each trip's title", () => {
    jest.mocked(useTrips).mockReturnValue({
      isPending: false,
      isError: false,
      data: [
        {
          id: "1",
          owner_id: "user-1",
          title: "Kyoto",
          content: {},
          cover_image_url: null,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "2",
          owner_id: "user-1",
          title: "Lisbon",
          content: {},
          cover_image_url: null,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      ],
    } as unknown as ReturnType<typeof useTrips>);

    renderTripsMenu();

    expect(screen.getByText("Kyoto")).toBeInTheDocument();
    expect(screen.getByText("Lisbon")).toBeInTheDocument();
  });
});
