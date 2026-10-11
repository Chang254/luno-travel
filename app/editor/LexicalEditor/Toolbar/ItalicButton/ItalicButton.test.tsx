import { render, screen } from "@/lib/test-utils";

import LexicalEditor from "../../../LexicalEditor";

describe("ItalicButton", () => {
  it("marks itself pressed once toggled on", async () => {
    const { user } = render(<LexicalEditor />);

    const italicButton = screen.getByRole("button", { name: "Italic" });
    expect(italicButton).toHaveAttribute("aria-pressed", "false");

    await user.click(italicButton);

    expect(italicButton).toHaveAttribute("aria-pressed", "true");
  });
});
