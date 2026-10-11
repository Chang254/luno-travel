import { render, screen } from "@/lib/test-utils";

import LexicalEditor from "../../../LexicalEditor";

describe("FontSelector", () => {
  it("updates its label after selecting Georgia", async () => {
    const { user } = render(<LexicalEditor />);

    await user.click(screen.getByRole("button", { name: /arial/i }));
    await user.click(await screen.findByRole("menuitem", { name: /georgia/i }));

    expect(screen.getByRole("button", { name: /georgia/i })).toBeInTheDocument();
  });
});
