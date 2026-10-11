import { render, screen } from "@testing-library/react";

import LexicalEditor from "../../../LexicalEditor";

describe("RedoButton", () => {
  it("is disabled before any edits", () => {
    render(<LexicalEditor />);

    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();
  });
});
