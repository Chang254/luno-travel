import { render, screen } from "@/lib/test-utils";

import LexicalEditor from "../../../LexicalEditor";

describe("InsertDropdown", () => {
  it("inserts an image block after selecting Image from the menu", async () => {
    const { user } = render(<LexicalEditor />);

    await user.click(screen.getByRole("button", { name: /insert/i }));
    await user.click(await screen.findByRole("menuitem", { name: /image/i }));

    expect(
      screen.getByRole("img", { name: /placeholder travel photo/i }),
    ).toBeInTheDocument();
  });
});
