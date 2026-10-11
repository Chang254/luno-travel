"use client";

import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import type { ElementFormatType, NodeKey } from "lexical";

import { getTripImageUrl } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";

import { useResizableWidth } from "./ImageComponent.helpers";
import { styles } from "./ImageComponent.styles";

interface ImageComponentProps {
  nodeKey: NodeKey;
  /** Object path in the trip images bucket. */
  src: string;
  alt: string;
  width: number;
  align: ElementFormatType;
}

export default function ImageComponent({ nodeKey, src, alt, width, align }: ImageComponentProps) {
  const [isSelected] = useLexicalNodeSelection(nodeKey);
  const { displayWidth, onResizeStart, onResizeMove, onResizeEnd } = useResizableWidth(
    nodeKey,
    width,
  );

  return (
    <div style={{ textAlign: align || "left" }}>
      <div className={cn(styles.wrapper, isSelected && styles.selected)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- width is user-resized inline, next/image needs fixed dimensions */}
        <img
          src={getTripImageUrl(src)}
          alt={alt}
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
