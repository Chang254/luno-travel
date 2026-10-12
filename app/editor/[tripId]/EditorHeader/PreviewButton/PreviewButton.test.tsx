import { useRouter } from "next/navigation";

import { render, screen, waitFor } from "@/lib/test-utils";
import { useUpdateTripContent } from "@/lib/api/trips";

import { useEditorSaveStore } from "../../EditorSaveStore.store";
import PreviewButton from "./PreviewButton";

jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/api/trips");
jest.mock("../../EditorSaveStore.store");

const mockEditor = {
  getEditorState: () => ({ toJSON: () => ({ root: {} }) }),
};

function setup({ isDirty, saveResult = Promise.resolve({}) }: { isDirty: boolean; saveResult?: Promise<unknown> }) {
  jest.mocked(useEditorSaveStore).mockImplementation((selector) =>
    selector({
      editor: mockEditor,
      isDirty,
      setEditor: jest.fn(),
      markDirty: jest.fn(),
      markSaved: jest.fn(),
    } as unknown as Parameters<typeof selector>[0]),
  );
  const saveDraft = jest.fn().mockReturnValue(saveResult);
  jest.mocked(useUpdateTripContent).mockReturnValue({
    mutateAsync: saveDraft,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateTripContent>);
  const push = jest.fn();
  jest.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>);

  return { saveDraft, push };
}

describe("PreviewButton", () => {
  it("opens the preview without saving when there are no unsaved changes", async () => {
    const { saveDraft, push } = setup({ isDirty: false });

    const { user } = render(<PreviewButton tripId="trip-1" />);
    await user.click(screen.getByRole("button", { name: "Preview" }));

    expect(saveDraft).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/trips/trip-1/preview");
  });

  it("saves unsaved changes before opening the preview", async () => {
    const { saveDraft, push } = setup({ isDirty: true });

    const { user } = render(<PreviewButton tripId="trip-1" />);
    await user.click(screen.getByRole("button", { name: "Preview" }));

    expect(saveDraft).toHaveBeenCalledWith({ id: "trip-1", content: { root: {} } });
    await waitFor(() => expect(push).toHaveBeenCalledWith("/trips/trip-1/preview"));
  });

  it("stays in the editor when saving fails", async () => {
    const { push } = setup({ isDirty: true, saveResult: Promise.reject(new Error("db down")) });

    const { user } = render(<PreviewButton tripId="trip-1" />);
    await user.click(screen.getByRole("button", { name: "Preview" }));

    expect(push).not.toHaveBeenCalled();
  });
});
