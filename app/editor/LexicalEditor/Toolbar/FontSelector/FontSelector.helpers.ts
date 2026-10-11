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

export const DEFAULT_FONT_FAMILY = "Arial";

export interface FontFamilyOption {
  label: string;
  value: string;
}

export const FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
  { label: "Arial", value: "Arial" },
  { label: "Georgia", value: "Georgia" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Courier New", value: "Courier New" },
  { label: "Verdana", value: "Verdana" },
];

/** Reads the selection's font family, falling back to the default when unset. */
export function getFontFamily(selection: BaseSelection | null): string {
  if (!$isRangeSelection(selection)) {
    return DEFAULT_FONT_FAMILY;
  }
  return $getSelectionStyleValueForProperty(
    selection,
    "font-family",
    DEFAULT_FONT_FAMILY,
  );
}

/** Applies `fontFamily` to the current selection. */
export function setFontFamily(editor: LexicalEditor, fontFamily: string): void {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $patchStyleText(selection, { "font-family": fontFamily });
    }
  });
}

/** Reads the selection's font family from the toolbar store and exposes the action to change it. */
export function useFontFamily() {
  const [editor] = useLexicalComposerContext();
  const fontFamily = useToolbarStore((state) => state.fontFamily);

  const setFamily = useCallback(
    (nextFontFamily: string) => {
      setFontFamily(editor, nextFontFamily);
    },
    [editor],
  );

  return { fontFamily, setFamily };
}
