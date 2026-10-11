"use client";

import { useCallback, useEffect } from "react";
import {
  $getSelection,
  $isElementNode,
  $isNodeSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  TextFormatType,
} from "lexical";
import { mergeRegister } from "@lexical/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import { $isImageNode } from "../ImageNode";
import { getBlockType } from "./BlockTypeDropdown/BlockTypeDropdown.helpers";
import { DEFAULT_TEXT_COLOR, getTextColor } from "./ColorSelector/ColorSelector.helpers";
import { DEFAULT_FONT_FAMILY, getFontFamily } from "./FontSelector/FontSelector.helpers";
import { useToolbarStore } from "./Toolbar.store";

const TRACKED_TEXT_FORMATS: TextFormatType[] = ["bold", "italic", "underline"];

/** Registers a single selection listener that syncs all toolbar active state into the zustand store. */
export function useSyncToolbarState() {
  const [editor] = useLexicalComposerContext();
  const setToolbarState = useToolbarStore((state) => state.setToolbarState);

  useEffect(() => {
    const syncState = () => {
      const selection = $getSelection();

      if ($isNodeSelection(selection)) {
        const imageNode = selection.getNodes().find($isImageNode);
        if (imageNode) {
          setToolbarState({
            textFormats: {},
            elementFormat: (imageNode.getAlign() || "left") as ElementFormatType,
            blockType: "paragraph",
            fontFamily: DEFAULT_FONT_FAMILY,
            textColor: DEFAULT_TEXT_COLOR,
          });
        }
        return;
      }

      if (!$isRangeSelection(selection)) {
        return;
      }

      const textFormats = Object.fromEntries(
        TRACKED_TEXT_FORMATS.map((format) => [format, selection.hasFormat(format)]),
      ) as Partial<Record<TextFormatType, boolean>>;

      const anchorNode = selection.anchor.getNode();
      const targetNode = $isElementNode(anchorNode)
        ? anchorNode
        : anchorNode.getParent();

      setToolbarState({
        textFormats,
        elementFormat: (targetNode?.getFormatType() || "left") as ElementFormatType,
        blockType: getBlockType(selection),
        fontFamily: getFontFamily(selection),
        textColor: getTextColor(selection),
      });
    };

    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(syncState);
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          syncState();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [editor, setToolbarState]);
}

/** Reads whether the selection has the `format` text format applied and exposes the toggle action. */
export function useTextFormatState(format: TextFormatType) {
  const [editor] = useLexicalComposerContext();
  const isActive = useToolbarStore((state) => state.textFormats[format] ?? false);

  const toggle = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  }, [editor, format]);

  return { isActive, toggle };
}

/** Reads whether the selection's element format matches `format` and exposes the align action. */
export function useElementFormatState(format: ElementFormatType) {
  const [editor] = useLexicalComposerContext();
  const isActive = useToolbarStore((state) => state.elementFormat === format);

  const align = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
  }, [editor, format]);

  return { isActive, align };
}
