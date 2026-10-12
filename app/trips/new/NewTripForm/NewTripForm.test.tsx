import userEvent from "@testing-library/user-event";

import { useCreateTrip } from "@/lib/api/trips";
import { render, screen } from "@/lib/test-utils";
import NewTripForm from "./NewTripForm";

jest.mock("@/lib/api/trips");

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mutate = jest.fn();

function mockCreateTrip(state: Partial<ReturnType<typeof useCreateTrip>> = {}) {
  jest.mocked(useCreateTrip).mockReturnValue({
    mutate,
    isPending: false,
    isError: false,
    ...state,
  } as unknown as ReturnType<typeof useCreateTrip>);
}

const cover = new File(["cover"], "cover.png", { type: "image/png" });

describe("NewTripForm", () => {
  beforeAll(() => {
    URL.createObjectURL = jest.fn(() => "blob:cover");
    URL.revokeObjectURL = jest.fn();
  });

  beforeEach(() => {
    mockCreateTrip();
  });

  it("disables submit until a title is entered", async () => {
    const { user } = render(<NewTripForm />);
    const submit = screen.getByRole("button", { name: "Create trip" });

    expect(submit).toBeDisabled();
    await user.type(screen.getByLabelText("Title"), "   ");
    expect(submit).toBeDisabled();
    await user.type(screen.getByLabelText("Title"), "Kyoto");
    expect(submit).toBeEnabled();
  });

  it("creates a trip with just a title", async () => {
    const { user } = render(<NewTripForm />);

    await user.type(screen.getByLabelText("Title"), "  Kyoto  ");
    await user.click(screen.getByRole("button", { name: "Create trip" }));

    expect(mutate).toHaveBeenCalledWith(
      { title: "Kyoto", coverImage: null },
      expect.anything(),
    );
  });

  it("creates a trip with a cover photo", async () => {
    const { user } = render(<NewTripForm />);

    await user.type(screen.getByLabelText("Title"), "Kyoto");
    await user.upload(screen.getByLabelText("Cover photo (optional)"), cover);
    await user.click(screen.getByRole("button", { name: "Create trip" }));

    expect(mutate).toHaveBeenCalledWith({ title: "Kyoto", coverImage: cover }, expect.anything());
  });

  it("previews the chosen cover and lets it be removed", async () => {
    const { user } = render(<NewTripForm />);

    await user.upload(screen.getByLabelText("Cover photo (optional)"), cover);
    expect(screen.getByAltText("Cover preview")).toHaveAttribute("src", "blob:cover");

    await user.click(screen.getByRole("button", { name: "Remove cover photo" }));
    expect(screen.queryByAltText("Cover preview")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Title"), "Kyoto");
    await user.click(screen.getByRole("button", { name: "Create trip" }));
    expect(mutate).toHaveBeenCalledWith({ title: "Kyoto", coverImage: null }, expect.anything());
  });

  it("rejects unsupported file types", async () => {
    render(<NewTripForm />);
    const user = userEvent.setup({ applyAccept: false });

    await user.upload(
      screen.getByLabelText("Cover photo (optional)"),
      new File(["<svg/>"], "cover.svg", { type: "image/svg+xml" }),
    );

    expect(screen.getByText("Choose a JPEG, PNG, GIF, WebP, or AVIF image.")).toBeInTheDocument();
    expect(screen.queryByAltText("Cover preview")).not.toBeInTheDocument();
  });

  it("opens the editor for the new trip once it's created", async () => {
    mutate.mockImplementation((_input, { onSuccess }) => onSuccess({ id: "trip-1" }));
    const { user } = render(<NewTripForm />);

    await user.type(screen.getByLabelText("Title"), "Kyoto");
    await user.click(screen.getByRole("button", { name: "Create trip" }));

    expect(mockPush).toHaveBeenCalledWith("/editor/trip-1");
  });

  it("shows a pending state while creating", () => {
    mockCreateTrip({ isPending: true });
    render(<NewTripForm />);

    expect(screen.getByRole("button", { name: /Creating…/ })).toBeDisabled();
  });

  it("shows an error when creation fails", () => {
    mockCreateTrip({ isError: true });
    render(<NewTripForm />);

    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't create the trip. Please try again.");
  });
});
