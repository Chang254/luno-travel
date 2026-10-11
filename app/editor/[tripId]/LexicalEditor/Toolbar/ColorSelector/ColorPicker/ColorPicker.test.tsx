import { render, screen } from "@/lib/test-utils";

import ColorPicker from "./ColorPicker";

describe("ColorPicker", () => {
  it("commits a valid hex typed into the input on Enter", async () => {
    const onChange = jest.fn();
    const { user } = render(<ColorPicker color="#000000" onChange={onChange} />);

    const hexInput = screen.getByLabelText(/hex color/i);
    await user.clear(hexInput);
    await user.type(hexInput, "1971c2{Enter}");

    expect(onChange).toHaveBeenLastCalledWith("#1971c2");
    expect(hexInput).toHaveValue("#1971c2");
  });

  it("reverts to the last valid hex when an invalid value is entered", async () => {
    const onChange = jest.fn();
    const { user } = render(<ColorPicker color="#1971c2" onChange={onChange} />);

    const hexInput = screen.getByLabelText(/hex color/i);
    await user.clear(hexInput);
    await user.type(hexInput, "not-a-color");
    await user.tab();

    expect(hexInput).toHaveValue("#1971c2");
    expect(onChange).not.toHaveBeenCalled();
  });
});
