import { render, screen } from "@/lib/test-utils";

import { useUpdateTripContent } from "../../../../../lib/api/trips";
import { useEditorSaveStore } from "../../EditorSaveStore.store";
import SaveButton from "./SaveButton";

jest.mock("../../../../../lib/api/trips");
jest.mock("../../EditorSaveStore.store");

const mockEditor = {
  getEditorState: () => ({ toJSON: () => ({ root: {} }) }),
};

function mockSaveStore(state: { editor: unknown; isDirty: boolean }) {
  jest.mocked(useEditorSaveStore).mockImplementation((selector) =>
    selector({
      ...state,
      setEditor: jest.fn(),
      markDirty: jest.fn(),
      markSaved: jest.fn(),
    } as unknown as Parameters<typeof selector>[0]),
  );
}

describe("SaveButton", () => {
  it("is disabled when there are no unsaved changes", () => {
    mockSaveStore({ editor: mockEditor, isDirty: false });
    jest.mocked(useUpdateTripContent).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateTripContent>);

    render(<SaveButton tripId="trip-1" />);

    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("is enabled and saves the serialized content when there are unsaved changes", async () => {
    mockSaveStore({ editor: mockEditor, isDirty: true });
    const mutate = jest.fn();
    jest.mocked(useUpdateTripContent).mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateTripContent>);

    const { user } = render(<SaveButton tripId="trip-1" />);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeEnabled();

    await user.click(button);

    expect(mutate).toHaveBeenCalledWith(
      { id: "trip-1", content: { root: {} } },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("shows a saving state and disables the button while the mutation is in flight", () => {
    mockSaveStore({ editor: mockEditor, isDirty: true });
    jest.mocked(useUpdateTripContent).mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof useUpdateTripContent>);

    render(<SaveButton tripId="trip-1" />);

    const button = screen.getByRole("button", { name: "Saving…" });
    expect(button).toBeDisabled();
  });
});
