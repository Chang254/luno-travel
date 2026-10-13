import { useCitySearch } from "@/lib/api/cities";
import { render, screen, waitFor } from "@/lib/test-utils";
import CityPicker from "./CityPicker";

jest.mock("@/lib/api/cities");

const kyoto = { geonameId: 1857910, primaryText: "Kyoto", secondaryText: "Kyoto, Japan", countryCode: "JP" };
const kyotera = { geonameId: 226110, primaryText: "Kyotera", secondaryText: "Uganda", countryCode: "UG" };

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

describe("CityPicker", () => {
  beforeEach(() => {
    mockSearch();
  });

  it("searches as the user types and returns the picked city", async () => {
    const onSelect = jest.fn();
    const { user } = render(<CityPicker aria-label="City" value={null} onSelect={onSelect} />);

    await user.type(screen.getByRole("combobox", { name: "City" }), "kyo");
    await user.click(await screen.findByRole("option", { name: /Kyoto/ }));

    expect(onSelect).toHaveBeenCalledWith({
      geonameId: 1857910,
      name: "Kyoto",
      countryCode: "JP",
    });
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    expect(useCitySearch).toHaveBeenLastCalledWith("");
  });

  it("doesn't show results for a one-letter query", async () => {
    const { user } = render(<CityPicker value={null} onSelect={jest.fn()} />);

    await user.type(screen.getByRole("combobox"), "k");

    await waitFor(() => expect(useCitySearch).toHaveBeenLastCalledWith("k"));
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("says when no cities match", async () => {
    mockSearch({ data: [] });
    const { user } = render(<CityPicker value={null} onSelect={jest.fn()} />);

    await user.type(screen.getByRole("combobox"), "zzz");

    expect(await screen.findByText("No cities found.")).toBeInTheDocument();
  });

  it("says when the search fails", async () => {
    mockSearch({ data: undefined, isError: true });
    const { user } = render(<CityPicker value={null} onSelect={jest.fn()} />);

    await user.type(screen.getByRole("combobox"), "kyo");

    expect(await screen.findByText("Couldn't search cities. Try again.")).toBeInTheDocument();
  });

  it("shows the current city with its flag", () => {
    render(<CityPicker value={{ name: "Kyoto", countryCode: "JP" }} onSelect={jest.fn()} />);

    expect(screen.getByRole("combobox")).toHaveValue("Kyoto");
    expect(screen.getByRole("img", { name: "Japan" })).toHaveAttribute("src", "/flags/JP.svg");
  });

  it("clears the city when the input is emptied and left", async () => {
    const onClear = jest.fn();
    const { user } = render(<CityPicker value={{ name: "Kyoto" }} onSelect={jest.fn()} onClear={onClear} />);

    await user.clear(screen.getByRole("combobox"));
    await user.tab();

    expect(onClear).toHaveBeenCalled();
  });

  it("clears the city on Enter in an empty input", async () => {
    const onClear = jest.fn();
    const { user } = render(<CityPicker value={{ name: "Kyoto" }} onSelect={jest.fn()} onClear={onClear} />);

    await user.clear(screen.getByRole("combobox"));
    await user.keyboard("{Enter}");

    expect(onClear).toHaveBeenCalled();
  });

  it("restores the current city when left without picking", async () => {
    const onClear = jest.fn();
    const { user } = render(<CityPicker value={{ name: "Kyoto" }} onSelect={jest.fn()} onClear={onClear} />);

    await user.type(screen.getByRole("combobox"), "{Control>}a{/Control}osa");
    await user.tab();

    expect(screen.getByRole("combobox")).toHaveValue("Kyoto");
    expect(onClear).not.toHaveBeenCalled();
  });

  it("restores the current city on Escape", async () => {
    const { user } = render(<CityPicker value={{ name: "Kyoto" }} onSelect={jest.fn()} />);

    await user.clear(screen.getByRole("combobox"));
    await user.keyboard("{Escape}");

    expect(screen.getByRole("combobox")).toHaveValue("Kyoto");
  });

  it("picks the highlighted suggestion with the keyboard", async () => {
    const onSelect = jest.fn();
    const { user } = render(<CityPicker value={null} onSelect={onSelect} />);

    await user.type(screen.getByRole("combobox"), "kyo");
    await screen.findByRole("option", { name: /Kyotera/ });
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ geonameId: 226110 }));
  });
});
