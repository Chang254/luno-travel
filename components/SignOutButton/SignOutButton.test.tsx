import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SignOutButton from "./SignOutButton";
import { signOut } from "./SignOutButton.actions";

jest.mock("./SignOutButton.actions", () => ({
  signOut: jest.fn(),
}));

describe("SignOutButton", () => {
  it("calls signOut when clicked", async () => {
    render(<SignOutButton />);

    await userEvent.click(screen.getByRole("button", { name: "Sign out" }));

    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
