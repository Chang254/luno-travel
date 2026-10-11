import { renderHook } from "@testing-library/react";
import { $createParagraphNode, $createTextNode, $getRoot, createEditor } from "lexical";
import type { LexicalEditor } from "lexical";

import { useSyncEditorSaveState } from "./EditorSaveStore.helpers";
import { useEditorSaveStore } from "./EditorSaveStore.store";

let testEditor: LexicalEditor;

jest.mock("@lexical/react/LexicalComposerContext", () => ({
  useLexicalComposerContext: () => [testEditor],
}));

/** Mirrors `BlockTypeDropdown.helpers.test.ts`'s headless editor setup. */
function createTestEditor(): LexicalEditor {
  return createEditor({
    namespace: "test",
    onError: (error) => {
      throw error;
    },
  });
}

describe("useSyncEditorSaveState", () => {
  beforeEach(() => {
    testEditor = createTestEditor();
    useEditorSaveStore.setState({ editor: null, isDirty: false });
  });

  it("captures the editor instance and starts not dirty", () => {
    renderHook(() => useSyncEditorSaveState());

    expect(useEditorSaveStore.getState().editor).toBe(testEditor);
    expect(useEditorSaveStore.getState().isDirty).toBe(false);
  });

  it("marks dirty after a real content edit", () => {
    renderHook(() => useSyncEditorSaveState());

    testEditor.update(
      () => {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode("hello"));
        $getRoot().append(paragraph);
      },
      { discrete: true },
    );

    expect(useEditorSaveStore.getState().isDirty).toBe(true);
  });

  it("resets isDirty for a freshly mounted editor instance (e.g. switching trips)", () => {
    const { unmount } = renderHook(() => useSyncEditorSaveState());
    useEditorSaveStore.setState({ isDirty: true });
    unmount();

    testEditor = createTestEditor();
    renderHook(() => useSyncEditorSaveState());

    expect(useEditorSaveStore.getState().isDirty).toBe(false);
  });
});
