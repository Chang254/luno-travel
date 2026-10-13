import { useCitySearch } from "@/lib/api/places";
import { useUpdateTripDetails } from "@/lib/api/trips";
import { render, screen, within } from "@/lib/test-utils";
import TripDetails from "./TripDetails";

jest.mock("@/lib/api/places");
jest.mock("@/lib/api/trips");

const mutate = jest.fn();
const reset = jest.fn();

function mockUpdateDetails(state: Partial<ReturnType<typeof useUpdateTripDetails>> = {}) {
  jest.mocked(useUpdateTripDetails).mockReturnValue({
    mutate,
    reset,
    isPending: false,
    isError: false,
    ...state,
  } as unknown as ReturnType<typeof useUpdateTripDetails>);
}

const details = {
  title: "Summer in Kyoto",
  cover_image_url: "user-1/trip-1/cover.png",
  city_place_id: "place-kyoto",
  city_name: "Kyoto",
  city_country_code: "JP",
};

const newCover = new File(["cover"], "new.png", { type: "image/png" });

async function openDialog(user: ReturnType<typeof render>["user"]) {
  await user.click(screen.getByRole("button", { name: "Edit trip details" }));
  return screen.getByRole("dialog", { name: "Trip details" });
}

describe("TripDetails", () => {
  beforeAll(() => {
    URL.createObjectURL = jest.fn(() => "blob:cover");
    URL.revokeObjectURL = jest.fn();
  });

  beforeEach(() => {
    mockUpdateDetails();
    jest.mocked(useCitySearch).mockReturnValue({
      data: [{ placeId: "place-osaka", primaryText: "Osaka", secondaryText: "Osaka, Japan" }],
      isFetching: false,
      isError: false,
    } as unknown as ReturnType<typeof useCitySearch>);
  });

  it("shows the title and place as text, not an input", () => {
    render(<TripDetails tripId="trip-1" initialDetails={details} />);

    expect(screen.getByRole("heading", { name: "Summer in Kyoto" })).toBeInTheDocument();
    expect(screen.getByText("Kyoto")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Japan" })).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("opens with the current details", async () => {
    const { user } = render(<TripDetails tripId="trip-1" initialDetails={details} />);

    const dialog = await openDialog(user);

    expect(within(dialog).getByLabelText("Title")).toHaveValue("Summer in Kyoto");
    expect(within(dialog).getByLabelText("Place")).toHaveValue("Kyoto");
    expect(within(dialog).getByAltText("Cover preview")).toHaveAttribute(
      "src",
      expect.stringContaining("user-1/trip-1/cover.png"),
    );
  });

  it("sends only the title when the place and cover are unchanged", async () => {
    const { user } = render(<TripDetails tripId="trip-1" initialDetails={details} />);
    const dialog = await openDialog(user);

    await user.clear(within(dialog).getByLabelText("Title"));
    await user.type(within(dialog).getByLabelText("Title"), "Kansai");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(mutate).toHaveBeenCalledWith(
      { id: "trip-1", title: "Kansai", city: undefined, coverImage: undefined },
      expect.anything(),
    );
  });

  it("sends a newly picked place", async () => {
    const { user } = render(<TripDetails tripId="trip-1" initialDetails={details} />);
    const dialog = await openDialog(user);

    await user.type(within(dialog).getByLabelText("Place"), "osa");
    await user.click(await screen.findByRole("option", { name: /Osaka/ }));
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(mutate).toHaveBeenCalledWith(
      {
        id: "trip-1",
        title: "Summer in Kyoto",
        city: { placeId: "place-osaka", sessionToken: expect.any(String) },
        coverImage: undefined,
      },
      expect.anything(),
    );
  });

  it("won't save without a place", async () => {
    const { user } = render(<TripDetails tripId="trip-1" initialDetails={details} />);
    const dialog = await openDialog(user);

    await user.clear(within(dialog).getByLabelText("Place"));
    await user.tab();

    expect(await within(dialog).findByText("Choose a place.")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("removes the cover", async () => {
    const { user } = render(<TripDetails tripId="trip-1" initialDetails={details} />);
    const dialog = await openDialog(user);

    await user.click(within(dialog).getByRole("button", { name: "Remove cover photo" }));
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ coverImage: null }),
      expect.anything(),
    );
  });

  it("replaces the cover with a newly chosen photo", async () => {
    const { user } = render(<TripDetails tripId="trip-1" initialDetails={details} />);
    const dialog = await openDialog(user);

    await user.click(within(dialog).getByRole("button", { name: "Remove cover photo" }));
    await user.upload(within(dialog).getByLabelText("Cover photo (optional)"), newCover);
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ coverImage: newCover }),
      expect.anything(),
    );
  });

  it("closes and shows the saved details once saved", async () => {
    mutate.mockImplementation((_input, { onSuccess }) =>
      onSuccess({ id: "trip-1", content: {}, ...details, title: "Kansai", city_name: "Osaka" }),
    );
    const { user } = render(<TripDetails tripId="trip-1" initialDetails={details} />);
    const dialog = await openDialog(user);

    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kansai" })).toBeInTheDocument();
    expect(screen.getByText("Osaka")).toBeInTheDocument();
  });

  it("discards unsaved edits when cancelled", async () => {
    const { user } = render(<TripDetails tripId="trip-1" initialDetails={details} />);
    let dialog = await openDialog(user);

    await user.type(within(dialog).getByLabelText("Title"), " draft");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    dialog = await openDialog(user);

    expect(within(dialog).getByLabelText("Title")).toHaveValue("Summer in Kyoto");
  });

  it("says when the details couldn't be saved", async () => {
    mockUpdateDetails({ isError: true });
    const { user } = render(<TripDetails tripId="trip-1" initialDetails={details} />);
    const dialog = await openDialog(user);

    expect(within(dialog).getByRole("alert")).toHaveTextContent("Couldn't save trip details");
  });
});
