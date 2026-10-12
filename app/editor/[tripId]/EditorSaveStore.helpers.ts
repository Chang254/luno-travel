"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { useUpdateTripContent } from "@/lib/api/trips";

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

/**
 * Saves unsaved editor changes so actions that read the stored draft (preview,
 * publish) see the latest edits. Resolves immediately when nothing is dirty and
 * rejects if the save fails.
 */
export function useSaveDraft(tripId: string) {
  const editor = useEditorSaveStore((state) => state.editor);
  const isDirty = useEditorSaveStore((state) => state.isDirty);
  const markSaved = useEditorSaveStore((state) => state.markSaved);
  const { mutateAsync, isPending } = useUpdateTripContent();

  async function saveDraft() {
    if (!editor || !isDirty) return;

    await mutateAsync({ id: tripId, content: editor.getEditorState().toJSON() });
    markSaved();
  }

  return { saveDraft, isSaving: isPending };
}
