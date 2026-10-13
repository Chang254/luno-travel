import { useCitySearch } from "@/lib/api/places";
import { useUpdateTripCity } from "@/lib/api/trips";
import { render, screen } from "@/lib/test-utils";
import TripCity from "./TripCity";

jest.mock("@/lib/api/places");
jest.mock("@/lib/api/trips");

const mutate = jest.fn();

function mockUpdateCity(state: Partial<ReturnType<typeof useUpdateTripCity>> = {}) {
  jest.mocked(useUpdateTripCity).mockReturnValue({
    mutate,
    isPending: false,
    isError: false,
    ...state,
  } as unknown as ReturnType<typeof useUpdateTripCity>);
}

const noCity = { city_place_id: null, city_name: null, city_country_code: null };
const kyotoColumns = { city_place_id: "place-kyoto", city_name: "Kyoto", city_country_code: "JP" };

async function pickKyoto(user: ReturnType<typeof render>["user"]) {
  await user.click(screen.getByRole("combobox", { name: "Trip city" }));
  await user.type(screen.getByPlaceholderText("Search cities…"), "kyo");
  await user.click(await screen.findByRole("option", { name: /Kyoto/ }));
}

describe("TripCity", () => {
  beforeEach(() => {
    mockUpdateCity();
    jest.mocked(useCitySearch).mockReturnValue({
      data: [{ placeId: "place-kyoto", primaryText: "Kyoto", secondaryText: "Kyoto, Japan" }],
      isFetching: false,
      isError: false,
    } as unknown as ReturnType<typeof useCitySearch>);
  });

  it("shows the saved city with its flag", () => {
    render(<TripCity tripId="trip-1" initialCity={kyotoColumns} />);

    expect(screen.getByRole("combobox", { name: "Trip city" })).toHaveTextContent("Kyoto");
    expect(screen.getByRole("img", { name: "Japan" })).toBeInTheDocument();
  });

  it("saves a picked city and shows the resolved flag once saved", async () => {
    mutate.mockImplementation((_input, { onSuccess }) => onSuccess({ id: "trip-1", ...kyotoColumns }));
    const { user } = render(<TripCity tripId="trip-1" initialCity={noCity} />);

    await pickKyoto(user);

    expect(mutate).toHaveBeenCalledWith(
      { id: "trip-1", city: { placeId: "place-kyoto", sessionToken: expect.any(String) } },
      expect.anything(),
    );
    expect(screen.getByRole("img", { name: "Japan" })).toBeInTheDocument();
  });

  it("shows the picked city while saving", async () => {
    const { user } = render(<TripCity tripId="trip-1" initialCity={noCity} />);

    await pickKyoto(user);

    expect(screen.getByRole("combobox", { name: "Trip city" })).toHaveTextContent("Kyoto");
  });

  it("restores the previous city when saving fails", async () => {
    mutate.mockImplementation((_input, { onError }) => onError(new Error("nope")));
    const { user } = render(<TripCity tripId="trip-1" initialCity={noCity} />);

    await pickKyoto(user);

    expect(screen.getByRole("combobox", { name: "Trip city" })).toHaveTextContent("Add a city");
  });

  it("clears the city", async () => {
    mutate.mockImplementation((_input, { onSuccess }) => onSuccess({ id: "trip-1", ...noCity }));
    const { user } = render(<TripCity tripId="trip-1" initialCity={kyotoColumns} />);

    await user.click(screen.getByRole("button", { name: "Remove city" }));

    expect(mutate).toHaveBeenCalledWith({ id: "trip-1", city: null }, expect.anything());
    expect(screen.getByRole("combobox", { name: "Trip city" })).toHaveTextContent("Add a city");
  });

  it("says when the city couldn't be saved", () => {
    mockUpdateCity({ isError: true });
    render(<TripCity tripId="trip-1" initialCity={kyotoColumns} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't save city");
  });
});
