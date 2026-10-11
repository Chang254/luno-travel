"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { useEditorSaveStore } from "./EditorSaveStore.store";

/**
 * Captures the editor instance into the save store and flags dirty state on
 * real content edits (as opposed to pure selection changes). Must run inside
 * LexicalExtensionComposer.
 */
export function useSyncEditorSaveState() {
  const [editor] = useLexicalComposerContext();
  const setEditor = useEditorSaveStore((state) => state.setEditor);
  const markDirty = useEditorSaveStore((state) => state.markDirty);
  const markSaved = useEditorSaveStore((state) => state.markSaved);

  useEffect(() => {
    setEditor(editor);
    markSaved();

    return editor.registerUpdateListener(({ dirtyElements, dirtyLeaves }) => {
      if (dirtyElements.size > 0 || dirtyLeaves.size > 0) {
        markDirty();
      }
    });
  }, [editor, setEditor, markDirty, markSaved]);
}
