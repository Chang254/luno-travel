import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LexicalEditor from "../../../LexicalEditor";

describe("UnderlineButton", () => {
  it("marks itself pressed once toggled on", async () => {
    const user = userEvent.setup();
    render(<LexicalEditor />);

    const underlineButton = screen.getByRole("button", { name: "Underline" });
    expect(underlineButton).toHaveAttribute("aria-pressed", "false");

    await user.click(underlineButton);

    expect(underlineButton).toHaveAttribute("aria-pressed", "true");
  });
});
