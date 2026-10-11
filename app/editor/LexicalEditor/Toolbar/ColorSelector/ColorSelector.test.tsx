import { render, screen } from "@/lib/test-utils";

import LexicalEditor from "../../../LexicalEditor";

describe("ColorSelector", () => {
  it("applies the selected color to the trigger icon", async () => {
    const { user } = render(<LexicalEditor />);

    const trigger = screen.getByRole("button", { name: /text color/i });
    await user.click(trigger);
    await user.click(await screen.findByRole("menuitem", { name: /blue/i }));

    expect(trigger.querySelector("svg")).toHaveStyle({ color: "#1971c2" });
  });
});
