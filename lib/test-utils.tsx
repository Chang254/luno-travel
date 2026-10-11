import type { ReactElement } from "react";
import { render as rtlRender } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/** Renders `ui` and returns a ready-to-use `user` session alongside the usual RTL utilities. */
function render(ui: ReactElement) {
  return {
    user: userEvent.setup(),
    ...rtlRender(ui),
  };
}

export * from "@testing-library/react";
export { render };
