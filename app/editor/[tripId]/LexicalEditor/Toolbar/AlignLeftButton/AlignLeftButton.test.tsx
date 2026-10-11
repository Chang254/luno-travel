import { render, screen } from "@testing-library/react";

import LexicalEditor from "../../../LexicalEditor";

describe("AlignLeftButton", () => {
  it("is pressed by default", () => {
    render(<LexicalEditor />);

    expect(
      screen.getByRole("button", { name: "Align left" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
