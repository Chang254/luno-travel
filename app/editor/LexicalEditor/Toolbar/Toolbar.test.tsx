import { render, screen } from "@/lib/test-utils";

import LexicalEditor from "../../LexicalEditor";

describe("Toolbar", () => {
  it("tracks multiple active text formats independently from a single sync", async () => {
    const { user } = render(<LexicalEditor />);

    const boldButton = screen.getByRole("button", { name: "Bold" });
    const italicButton = screen.getByRole("button", { name: "Italic" });

    await user.click(boldButton);
    await user.click(italicButton);

    expect(boldButton).toHaveAttribute("aria-pressed", "true");
    expect(italicButton).toHaveAttribute("aria-pressed", "true");

    await user.click(boldButton);

    expect(boldButton).toHaveAttribute("aria-pressed", "false");
    expect(italicButton).toHaveAttribute("aria-pressed", "true");
  });

  it("updates alignment state without clobbering text format state", async () => {
    const { user } = render(<LexicalEditor />);

    const boldButton = screen.getByRole("button", { name: "Bold" });
    const centerButton = screen.getByRole("button", { name: "Align center" });
    const leftButton = screen.getByRole("button", { name: "Align left" });

    await user.click(boldButton);
    await user.click(centerButton);

    expect(boldButton).toHaveAttribute("aria-pressed", "true");
    expect(centerButton).toHaveAttribute("aria-pressed", "true");
    expect(leftButton).toHaveAttribute("aria-pressed", "false");
  });
});
