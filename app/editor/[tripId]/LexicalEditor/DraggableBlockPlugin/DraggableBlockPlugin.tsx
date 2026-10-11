"use client";

import { useRef } from "react";
import { GripVertical } from "lucide-react";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";

import {
  DRAGGABLE_BLOCK_MENU_ATTRIBUTE,
  isOnDraggableBlockMenu,
} from "./DraggableBlockPlugin.helpers";
import { styles } from "./DraggableBlockPlugin.styles";

interface DraggableBlockPluginProps {
  /** Element that the drag handle and drop-target line are positioned against. */
  anchorElem: HTMLElement;
}

/** Shows a drag handle next to the hovered top-level block, letting users reorder blocks via drag and drop. */
export default function DraggableBlockPlugin({ anchorElem }: DraggableBlockPluginProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);

  return (
    <DraggableBlockPlugin_EXPERIMENTAL
      anchorElem={anchorElem}
      menuRef={menuRef}
      targetLineRef={targetLineRef}
      menuComponent={
        <div ref={menuRef} className={styles.menu} {...{ [DRAGGABLE_BLOCK_MENU_ATTRIBUTE]: true }}>
          <GripVertical className={styles.icon} />
        </div>
      }
      targetLineComponent={<div ref={targetLineRef} className={styles.targetLine} />}
      isOnMenu={isOnDraggableBlockMenu}
    />
  );
}
