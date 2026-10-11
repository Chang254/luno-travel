import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LexicalEditor from "../../../LexicalEditor";

describe("ItalicButton", () => {
  it("marks itself pressed once toggled on", async () => {
    const user = userEvent.setup();
    render(<LexicalEditor />);

    const italicButton = screen.getByRole("button", { name: "Italic" });
    expect(italicButton).toHaveAttribute("aria-pressed", "false");

    await user.click(italicButton);

    expect(italicButton).toHaveAttribute("aria-pressed", "true");
  });
});
