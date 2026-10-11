"use client";

import { useCallback, useEffect, useState } from "react";
import {
  $getSelection,
  $isElementNode,
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

/** Tracks whether the selection's element format matches `format` and exposes the align action. */
export function useElementFormatState(format: ElementFormatType) {
  const [editor] = useLexicalComposerContext();
  const [isActive, setIsActive] = useState(format === "left");

  useEffect(() => {
    const syncState = () => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }
      const anchorNode = selection.anchor.getNode();
      const targetNode = $isElementNode(anchorNode)
        ? anchorNode
        : anchorNode.getParent();
      setIsActive((targetNode?.getFormatType() || "left") === format);
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
  }, [editor, format]);

  const align = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
  }, [editor, format]);

  return { isActive, align };
}

/** Tracks whether the selection has the `format` text format applied and exposes the toggle action. */
export function useTextFormatState(format: TextFormatType) {
  const [editor] = useLexicalComposerContext();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const syncState = () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        setIsActive(selection.hasFormat(format));
      }
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
  }, [editor, format]);

  const toggle = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  }, [editor, format]);

  return { isActive, toggle };
}
