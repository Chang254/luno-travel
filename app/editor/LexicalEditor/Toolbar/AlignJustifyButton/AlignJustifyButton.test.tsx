import { render, screen } from "@/lib/test-utils";

import LexicalEditor from "../../../LexicalEditor";

describe("AlignJustifyButton", () => {
  it("marks itself pressed once clicked", async () => {
    const { user } = render(<LexicalEditor />);

    const justifyButton = screen.getByRole("button", { name: "Justify" });
    expect(justifyButton).toHaveAttribute("aria-pressed", "false");

    await user.click(justifyButton);

    expect(justifyButton).toHaveAttribute("aria-pressed", "true");
  });
});
