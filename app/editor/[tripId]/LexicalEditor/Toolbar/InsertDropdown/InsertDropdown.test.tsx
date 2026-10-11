import { render, screen, waitFor } from "@/lib/test-utils";
import { useUploadTripImage } from "@/lib/api/trips";

import LexicalEditor from "../../../LexicalEditor";

jest.mock("@/lib/api/trips");

function mockUpload(mutateAsync: jest.Mock) {
  jest.mocked(useUploadTripImage).mockReturnValue({
    mutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useUploadTripImage>);
}

const kyotoFile = new File(["image"], "kyoto-temple.png", { type: "image/png" });

describe("InsertDropdown", () => {
  it("uploads the chosen file and inserts an image pointing at the stored path", async () => {
    const mutateAsync = jest.fn().mockResolvedValue("user-1/trip-1/abc.png");
    mockUpload(mutateAsync);
    const { user } = render(<LexicalEditor tripId="trip-1" />);

    await user.click(screen.getByRole("button", { name: /insert/i }));
    await user.click(await screen.findByRole("menuitem", { name: /image/i }));
    await user.upload(screen.getByLabelText(/upload image/i), kyotoFile);

    const img = await screen.findByRole("img", { name: "kyoto-temple" });
    expect(mutateAsync).toHaveBeenCalledWith({ tripId: "trip-1", file: kyotoFile });
    expect(img.getAttribute("src")).toMatch(/\/Luno%20Images\/user-1\/trip-1\/abc\.png$/);
  });

  it("does not insert an image when the upload fails", async () => {
    const mutateAsync = jest.fn().mockRejectedValue(new Error("upload failed"));
    mockUpload(mutateAsync);
    jest.spyOn(console, "error").mockImplementation(() => {});
    const { user } = render(<LexicalEditor tripId="trip-1" />);

    await user.upload(screen.getByLabelText(/upload image/i), kyotoFile);

    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("disables the Image option when there is no trip to upload to", async () => {
    mockUpload(jest.fn());
    const { user } = render(<LexicalEditor />);

    await user.click(screen.getByRole("button", { name: /insert/i }));

    expect(await screen.findByRole("menuitem", { name: /image/i })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});
