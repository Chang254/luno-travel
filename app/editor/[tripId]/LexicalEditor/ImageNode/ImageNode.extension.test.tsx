import { render, screen } from "@/lib/test-utils";
import { useUploadTripImage } from "@/lib/api/trips";

import LexicalEditor from "../LexicalEditor";

jest.mock("@/lib/api/trips");

/** Inserts an image through the real menu + file input with the upload mocked out. */
async function insertImage() {
  jest.mocked(useUploadTripImage).mockReturnValue({
    mutateAsync: jest.fn().mockResolvedValue("user-1/trip-1/abc.png"),
    isPending: false,
  } as unknown as ReturnType<typeof useUploadTripImage>);
  const { user } = render(<LexicalEditor tripId="trip-1" />);
  await user.click(screen.getByRole("button", { name: /insert/i }));
  await user.click(await screen.findByRole("menuitem", { name: /image/i }));
  await user.upload(
    screen.getByLabelText(/upload image/i),
    new File(["image"], "kyoto.png", { type: "image/png" }),
  );
  await screen.findByRole("img", { name: "kyoto" });
  return user;
}

describe("ImageExtension", () => {
  it("aligns the selected image when an align button is clicked", async () => {
    const user = await insertImage();

    const img = screen.getByRole("img", { name: "kyoto" });
    await user.click(img);

    const centerButton = screen.getByRole("button", { name: "Align center" });
    await user.click(centerButton);

    expect(centerButton).toHaveAttribute("aria-pressed", "true");
    expect(img.parentElement?.parentElement).toHaveStyle({ textAlign: "center" });
  });

  it("shows a selection ring once the image is clicked", async () => {
    const user = await insertImage();

    const img = screen.getByRole("img", { name: "kyoto" });
    const wrapper = img.parentElement as HTMLElement;

    expect(wrapper.className).not.toMatch(/ring-2/);

    await user.click(img);

    expect(wrapper.className).toMatch(/ring-2/);
  });
});
