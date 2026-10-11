import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GoogleSignInButton from "./GoogleSignInButton";
import { signInWithGoogle } from "./GoogleSignInButton.actions";

jest.mock("./GoogleSignInButton.actions", () => ({
  signInWithGoogle: jest.fn(),
}));

describe("GoogleSignInButton", () => {
  it("calls signInWithGoogle when clicked", async () => {
    render(<GoogleSignInButton />);

    await userEvent.click(
      screen.getByRole("button", { name: "Sign in with Google" }),
    );

    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
  });
});
