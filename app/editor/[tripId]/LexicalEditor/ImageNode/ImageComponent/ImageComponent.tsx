"use client";

import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import type { ElementFormatType, NodeKey } from "lexical";

import { cn } from "@/lib/utils";

import { PRESET_IMAGE_ALT, PRESET_IMAGE_SRC } from "../ImageNode";
import { useResizableWidth } from "./ImageComponent.helpers";
import { styles } from "./ImageComponent.styles";

interface ImageComponentProps {
  nodeKey: NodeKey;
  width: number;
  align: ElementFormatType;
}

export default function ImageComponent({ nodeKey, width, align }: ImageComponentProps) {
  const [isSelected] = useLexicalNodeSelection(nodeKey);
  const { displayWidth, onResizeStart, onResizeMove, onResizeEnd } = useResizableWidth(
    nodeKey,
    width,
  );

  return (
    <div style={{ textAlign: align || "left" }}>
      <div className={cn(styles.wrapper, isSelected && styles.selected)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- hardcoded preset, see TODO in ImageNode.tsx */}
        <img
          src={PRESET_IMAGE_SRC}
          alt={PRESET_IMAGE_ALT}
          className={styles.image}
          style={{ width: displayWidth, height: "auto" }}
        />
        <div
          aria-hidden="true"
          title="Drag to resize"
          className={styles.resizeHandle}
          onPointerDown={onResizeStart}
          onPointerMove={onResizeMove}
          onPointerUp={onResizeEnd}
        />
      </div>
    </div>
  );
}
