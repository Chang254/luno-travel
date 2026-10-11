import { render, screen } from "@/lib/test-utils";

import LexicalEditor from "../../../LexicalEditor";

describe("BoldButton", () => {
  it("marks itself pressed once toggled on", async () => {
    const { user } = render(<LexicalEditor />);

    const boldButton = screen.getByRole("button", { name: "Bold" });
    expect(boldButton).toHaveAttribute("aria-pressed", "false");

    await user.click(boldButton);

    expect(boldButton).toHaveAttribute("aria-pressed", "true");
  });
});
