import { render, screen } from "@testing-library/react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { useTrips } from "../../../lib/api/trips";
import TripsMenu from "./TripsMenu";

jest.mock("../../../lib/api/trips");

const mockUsePathname = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

function renderTripsMenu() {
  return render(
    <SidebarProvider>
      <TripsMenu />
    </SidebarProvider>,
  );
}

describe("TripsMenu", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
  });

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

  it("links each trip to its editor route", () => {
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
          city_name: null,
          city_country_code: null,
          city_latitude: null,
          city_longitude: null,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "2",
          owner_id: "user-1",
          title: "Lisbon",
          content: {},
          cover_image_url: null,
          city_name: null,
          city_country_code: null,
          city_latitude: null,
          city_longitude: null,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      ],
    } as unknown as ReturnType<typeof useTrips>);

    renderTripsMenu();

    expect(screen.getByRole("link", { name: "Kyoto" })).toHaveAttribute(
      "href",
      "/editor/1",
    );
    expect(screen.getByRole("link", { name: "Lisbon" })).toHaveAttribute(
      "href",
      "/editor/2",
    );
  });

  it("marks the current trip's link as active", () => {
    mockUsePathname.mockReturnValue("/editor/1");
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
          city_name: null,
          city_country_code: null,
          city_latitude: null,
          city_longitude: null,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "2",
          owner_id: "user-1",
          title: "Lisbon",
          content: {},
          cover_image_url: null,
          city_name: null,
          city_country_code: null,
          city_latitude: null,
          city_longitude: null,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      ],
    } as unknown as ReturnType<typeof useTrips>);

    renderTripsMenu();

    expect(screen.getByRole("link", { name: "Kyoto" })).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(screen.getByRole("link", { name: "Lisbon" })).toHaveAttribute(
      "data-active",
      "false",
    );
  });
});
