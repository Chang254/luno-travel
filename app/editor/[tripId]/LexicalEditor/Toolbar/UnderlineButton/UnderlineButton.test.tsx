import { render, screen } from "@/lib/test-utils";

import LexicalEditor from "../../../LexicalEditor";

describe("UnderlineButton", () => {
  it("marks itself pressed once toggled on", async () => {
    const { user } = render(<LexicalEditor />);

    const underlineButton = screen.getByRole("button", { name: "Underline" });
    expect(underlineButton).toHaveAttribute("aria-pressed", "false");

    await user.click(underlineButton);

    expect(underlineButton).toHaveAttribute("aria-pressed", "true");
  });
});
