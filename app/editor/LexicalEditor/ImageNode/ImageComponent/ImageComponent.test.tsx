import { render, screen, waitFor } from "@/lib/test-utils";

import LexicalEditor from "../../LexicalEditor";
import { MIN_IMAGE_WIDTH } from "../ImageNode";

async function renderWithImage() {
  const { user } = render(<LexicalEditor />);
  await user.click(screen.getByRole("button", { name: /insert/i }));
  await user.click(await screen.findByRole("menuitem", { name: /image/i }));
  return user;
}

describe("ImageComponent", () => {
  it("updates the image width while dragging and keeps it after release", async () => {
    const user = await renderWithImage();

    const img = screen.getByRole("img", { name: /placeholder travel photo/i });
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

    const img = screen.getByRole("img", { name: /placeholder travel photo/i });
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
