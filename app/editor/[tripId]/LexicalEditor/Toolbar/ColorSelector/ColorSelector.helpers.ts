"use client";

import { useCallback } from "react";
import {
  $getSelection,
  $isRangeSelection,
  type BaseSelection,
  type LexicalEditor,
} from "lexical";
import { $getSelectionStyleValueForProperty, $patchStyleText } from "@lexical/selection";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { useToolbarStore } from "../Toolbar.store";

export const DEFAULT_TEXT_COLOR = "#000000";

export interface TextColorOption {
  label: string;
  value: string;
}

export const TEXT_COLOR_OPTIONS: TextColorOption[] = [
  { label: "Black", value: "#000000" },
  { label: "Slate", value: "#64748b" },
  { label: "Red", value: "#e03131" },
  { label: "Orange", value: "#f08c00" },
  { label: "Yellow", value: "#f2c94c" },
  { label: "Green", value: "#2f9e44" },
  { label: "Teal", value: "#0ca678" },
  { label: "Blue", value: "#1971c2" },
  { label: "Indigo", value: "#4263eb" },
  { label: "Purple", value: "#9c36b5" },
];

/** Reads the selection's text color, falling back to the default when unset. */
export function getTextColor(selection: BaseSelection | null): string {
  if (!$isRangeSelection(selection)) {
    return DEFAULT_TEXT_COLOR;
  }
  return $getSelectionStyleValueForProperty(selection, "color", DEFAULT_TEXT_COLOR);
}

/** Applies `color` to the current selection. */
export function setTextColor(editor: LexicalEditor, color: string): void {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $patchStyleText(selection, { color });
    }
  });
}

/** Reads the selection's text color from the toolbar store and exposes the action to change it. */
export function useTextColor() {
  const [editor] = useLexicalComposerContext();
  const color = useToolbarStore((state) => state.textColor);

  const setColor = useCallback(
    (nextColor: string) => {
      setTextColor(editor, nextColor);
    },
    [editor],
  );

  return { color, setColor };
}
