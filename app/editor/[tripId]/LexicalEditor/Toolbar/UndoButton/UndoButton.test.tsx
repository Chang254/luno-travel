import { render, screen } from "@testing-library/react";

import LexicalEditor from "../../../LexicalEditor";

describe("UndoButton", () => {
  it("is disabled before any edits", () => {
    render(<LexicalEditor />);

    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
  });
});
