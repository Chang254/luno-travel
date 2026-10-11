import { render, screen, waitFor } from "@/lib/test-utils";
import { useUploadTripImage } from "@/lib/api/trips";

import LexicalEditor from "../../LexicalEditor";
import { MIN_IMAGE_WIDTH } from "../ImageNode";

jest.mock("@/lib/api/trips");

/** Inserts an image through the real menu + file input with the upload mocked out. */
async function renderWithImage() {
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

describe("ImageComponent", () => {
  it("updates the image width while dragging and keeps it after release", async () => {
    const user = await renderWithImage();

    const img = screen.getByRole("img", { name: "kyoto" });
    const handle = screen.getByTitle(/drag to resize/i);
    const initialWidth = parseInt(img.style.width, 10);

    await user.pointer([
      { keys: "[MouseLeft>]", target: handle, coords: { clientX: 0 } },
      { target: handle, coords: { clientX: 80 } },
    ]);

    expect(img.style.width).toBe(`${initialWidth + 80}px`);

    await user.pointer({ keys: "[/MouseLeft]", target: handle, coords: { clientX: 80 } });

    await waitFor(() => {
      expect(img.style.width).toBe(`${initialWidth + 80}px`);
    });
  });

  it("clamps the width to the configured minimum when dragged past it", async () => {
    const user = await renderWithImage();

    const img = screen.getByRole("img", { name: "kyoto" });
    const handle = screen.getByTitle(/drag to resize/i);

    await user.pointer([
      { keys: "[MouseLeft>]", target: handle, coords: { clientX: 0 } },
      { target: handle, coords: { clientX: -1000 } },
      { keys: "[/MouseLeft]", target: handle, coords: { clientX: -1000 } },
    ]);

    await waitFor(() => {
      expect(img.style.width).toBe(`${MIN_IMAGE_WIDTH}px`);
    });
  });
});
