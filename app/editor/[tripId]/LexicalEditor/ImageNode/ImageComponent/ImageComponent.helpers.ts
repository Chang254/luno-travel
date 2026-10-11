"use client";

import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";
import type { NodeKey } from "lexical";

import { $isImageNode, clampImageWidth } from "../ImageNode";

/** Drags the image's stored width from its resize handle, previewing locally until release. */
export function useResizableWidth(nodeKey: NodeKey, width: number) {
  const [editor] = useLexicalComposerContext();
  const [previewWidth, setPreviewWidth] = useState<number | null>(null);
  const dragStart = useRef({ pointerX: 0, width: 0 });

  const displayWidth = previewWidth ?? width;

  function onResizeStart(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    dragStart.current = { pointerX: event.clientX, width: displayWidth };
    setPreviewWidth(displayWidth);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onResizeMove(event: PointerEvent<HTMLDivElement>) {
    if (previewWidth === null) return;
    const delta = event.clientX - dragStart.current.pointerX;
    setPreviewWidth(clampImageWidth(dragStart.current.width + delta));
  }

  function onResizeEnd(event: PointerEvent<HTMLDivElement>) {
    if (previewWidth === null) return;
    const finalWidth = previewWidth;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setPreviewWidth(null);
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setWidth(finalWidth);
      }
    });
  }

  return { displayWidth, onResizeStart, onResizeMove, onResizeEnd };
}
