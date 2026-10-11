import { render, screen } from "@/lib/test-utils";

import LexicalEditor from "../../../LexicalEditor";

describe("BlockTypeDropdown", () => {
  it("updates its label after selecting Heading 1", async () => {
    const { user } = render(<LexicalEditor />);

    await user.click(screen.getByRole("button", { name: /normal/i }));
    await user.click(await screen.findByRole("menuitem", { name: /heading 1/i }));

    expect(
      screen.getByRole("button", { name: /heading 1/i }),
    ).toBeInTheDocument();
  });
});
