import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LexicalEditor from "../../../LexicalEditor";

describe("AlignCenterButton", () => {
  it("marks itself pressed once clicked", async () => {
    const user = userEvent.setup();
    render(<LexicalEditor />);

    const centerButton = screen.getByRole("button", { name: "Align center" });
    expect(centerButton).toHaveAttribute("aria-pressed", "false");

    await user.click(centerButton);

    expect(centerButton).toHaveAttribute("aria-pressed", "true");
  });
});
