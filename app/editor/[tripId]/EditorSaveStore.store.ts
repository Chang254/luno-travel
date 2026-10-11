import { create } from "zustand";
import type { LexicalEditor as LexicalEditorInstance } from "lexical";

interface EditorSaveState {
  editor: LexicalEditorInstance | null;
  isDirty: boolean;
  setEditor: (editor: LexicalEditorInstance) => void;
  markDirty: () => void;
  markSaved: () => void;
}

/**
 * Bridges the Lexical editor instance and its dirty state out to components
 * (e.g. SaveButton) that render outside LexicalExtensionComposer's React context.
 */
export const useEditorSaveStore = create<EditorSaveState>((set) => ({
  editor: null,
  isDirty: false,
  setEditor: (editor) => set({ editor }),
  markDirty: () => set({ isDirty: true }),
  markSaved: () => set({ isDirty: false }),
}));
