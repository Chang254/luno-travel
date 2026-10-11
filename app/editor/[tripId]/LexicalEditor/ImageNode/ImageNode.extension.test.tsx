import { render, screen } from "@/lib/test-utils";

import LexicalEditor from "../LexicalEditor";

async function insertImage() {
  const { user } = render(<LexicalEditor />);
  await user.click(screen.getByRole("button", { name: /insert/i }));
  await user.click(await screen.findByRole("menuitem", { name: /image/i }));
  return user;
}

describe("ImageExtension", () => {
  it("aligns the selected image when an align button is clicked", async () => {
    const user = await insertImage();

    const img = screen.getByRole("img", { name: /placeholder travel photo/i });
    await user.click(img);

    const centerButton = screen.getByRole("button", { name: "Align center" });
    await user.click(centerButton);

    expect(centerButton).toHaveAttribute("aria-pressed", "true");
    expect(img.parentElement?.parentElement).toHaveStyle({ textAlign: "center" });
  });

  it("shows a selection ring once the image is clicked", async () => {
    const user = await insertImage();

    const img = screen.getByRole("img", { name: /placeholder travel photo/i });
    const wrapper = img.parentElement as HTMLElement;

    expect(wrapper.className).not.toMatch(/ring-2/);

    await user.click(img);

    expect(wrapper.className).toMatch(/ring-2/);
  });
});
