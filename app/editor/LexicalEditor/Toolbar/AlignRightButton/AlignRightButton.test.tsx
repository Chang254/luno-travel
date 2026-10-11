import { render, screen } from "@/lib/test-utils";

import LexicalEditor from "../../../LexicalEditor";

describe("AlignRightButton", () => {
  it("marks itself pressed once clicked", async () => {
    const { user } = render(<LexicalEditor />);

    const rightButton = screen.getByRole("button", { name: "Align right" });
    expect(rightButton).toHaveAttribute("aria-pressed", "false");

    await user.click(rightButton);

    expect(rightButton).toHaveAttribute("aria-pressed", "true");
  });
});
