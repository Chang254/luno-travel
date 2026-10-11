"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CAN_REDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  REDO_COMMAND,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

/** Tracks whether the editor has redo history and exposes the redo action. */
export function useCanRedo() {
  const [editor] = useLexicalComposerContext();
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    return editor.registerCommand(
      CAN_REDO_COMMAND,
      (payload) => {
        setCanRedo(payload);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor]);

  const redo = useCallback(() => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  }, [editor]);

  return { canRedo, redo };
}
