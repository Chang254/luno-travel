import { useCitySearch } from "@/lib/api/places";
import { render, screen, waitFor } from "@/lib/test-utils";
import CityPicker from "./CityPicker";

jest.mock("@/lib/api/places");

const kyoto = { placeId: "place-kyoto", primaryText: "Kyoto", secondaryText: "Kyoto, Japan" };
const kyotera = { placeId: "place-kyotera", primaryText: "Kyotera", secondaryText: "Uganda" };

function mockSearch(state: Partial<ReturnType<typeof useCitySearch>> = {}) {
  jest.mocked(useCitySearch).mockImplementation(
    (query) =>
      ({
        data: query.length >= 2 ? [kyoto, kyotera] : undefined,
        isFetching: false,
        isError: false,
        ...state,
      }) as unknown as ReturnType<typeof useCitySearch>,
  );
}

/** Session tokens passed to the search hook, in call order. */
function searchedTokens() {
  return jest.mocked(useCitySearch).mock.calls.map(([, token]) => token);
}

describe("CityPicker", () => {
  beforeEach(() => {
    mockSearch();
  });

  it("searches as the user types and returns the picked city", async () => {
    const onSelect = jest.fn();
    const { user } = render(<CityPicker aria-label="City" value={null} onSelect={onSelect} />);

    await user.click(screen.getByRole("combobox", { name: "City" }));
    await user.type(screen.getByPlaceholderText("Search cities…"), "kyo");
    await user.click(await screen.findByRole("option", { name: /Kyoto/ }));

    expect(onSelect).toHaveBeenCalledWith({
      placeId: "place-kyoto",
      sessionToken: expect.stringMatching(/^[0-9a-f-]{36}$/),
      name: "Kyoto",
      detail: "Kyoto, Japan",
    });
    expect(screen.queryByPlaceholderText("Search cities…")).not.toBeInTheDocument();
    expect(useCitySearch).toHaveBeenLastCalledWith("", expect.any(String));
  });

  it("uses one session token per search and a fresh one after a pick", async () => {
    const onSelect = jest.fn();
    const { user } = render(<CityPicker value={null} onSelect={onSelect} />);

    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByPlaceholderText("Search cities…"), "kyo");
    await user.click(await screen.findByRole("option", { name: /Kyoto/ }));

    const firstToken = onSelect.mock.calls[0][0].sessionToken;
    const tokens = searchedTokens();
    const pickIndex = tokens.lastIndexOf(firstToken);
    expect(tokens.slice(0, pickIndex + 1).every((token) => token === firstToken)).toBe(true);
    expect(tokens.at(-1)).not.toBe(firstToken);
  });

  it("doesn't show results for a one-letter query", async () => {
    const { user } = render(<CityPicker value={null} onSelect={jest.fn()} />);

    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByPlaceholderText("Search cities…"), "k");

    await waitFor(() => expect(useCitySearch).toHaveBeenLastCalledWith("k", expect.any(String)));
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("says when no cities match", async () => {
    mockSearch({ data: [] });
    const { user } = render(<CityPicker value={null} onSelect={jest.fn()} />);

    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByPlaceholderText("Search cities…"), "zzz");

    expect(await screen.findByText("No cities found.")).toBeInTheDocument();
  });

  it("says when the search fails", async () => {
    mockSearch({ data: undefined, isError: true });
    const { user } = render(<CityPicker value={null} onSelect={jest.fn()} />);

    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByPlaceholderText("Search cities…"), "kyo");

    expect(await screen.findByText("Couldn't search cities. Try again.")).toBeInTheDocument();
  });

  it("shows the current city with its flag and lets it be removed", async () => {
    const onClear = jest.fn();
    const { user } = render(
      <CityPicker value={{ name: "Kyoto", countryCode: "JP" }} onSelect={jest.fn()} onClear={onClear} />,
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("Kyoto");
    expect(screen.getByRole("img", { name: "Japan" })).toHaveAttribute("src", "/flags/JP.svg");

    await user.click(screen.getByRole("button", { name: "Remove city" }));
    expect(onClear).toHaveBeenCalled();
  });
});
