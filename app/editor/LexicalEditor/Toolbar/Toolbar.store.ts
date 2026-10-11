import { create } from "zustand";
import type { ElementFormatType, TextFormatType } from "lexical";

import type { BlockType } from "./BlockTypeDropdown/BlockTypeDropdown.helpers";

interface ToolbarState {
  /** Tracks the active text formats (eg. bold, italic, underline) */
  textFormats: Partial<Record<TextFormatType, boolean>>;
  /** Tracks the active element format (eg. left, center, right) */
  elementFormat: ElementFormatType;
  /** Tracks the active block type (eg. paragraph, heading, list) */
  blockType: BlockType;
  /** Tracks the selection's font family */
  fontFamily: string;
  /** Tracks the selection's text color */
  textColor: string;
  /** Sets the toolbar state */
  setToolbarState: (
    state: Pick<
      ToolbarState,
      "textFormats" | "elementFormat" | "blockType" | "fontFamily" | "textColor"
    >,
  ) => void;
}

/** Holds the toolbar's active/pressed state, synced from the editor's current selection. */
export const useToolbarStore = create<ToolbarState>((set) => ({
  textFormats: {},
  elementFormat: "left",
  blockType: "paragraph",
  fontFamily: "Arial",
  textColor: "#000000",
  setToolbarState: (state) => set(state),
}));
