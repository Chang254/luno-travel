"use client";

import { useMemo, useState } from "react";
import { configExtension, defineExtension } from "lexical";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import {
  ReactExtension,
  type EditorChildrenComponentProps,
} from "@lexical/react/ReactExtension";

import type { Trip } from "@/server/models/trips.types";

import Toolbar from "./Toolbar";
import DraggableBlockPlugin from "./DraggableBlockPlugin";
import {
  editorConfig,
  editorExtensionDependencies,
  getInitialEditorState,
} from "./LexicalEditor.helpers";
import { styles } from "./LexicalEditor.styles";

/** Renders the toolbar above the content-editable surface */
function EditorLayout({ contentEditable, children }: EditorChildrenComponentProps) {
  const [editorInnerElem, setEditorInnerElem] = useState<HTMLDivElement | null>(null);

  return (
    <div className={styles.container}>
      {children}
      <div className={styles.editorScroller}>
        <div ref={setEditorInnerElem} className={styles.editorInner}>
          {contentEditable}
          {editorInnerElem && <DraggableBlockPlugin anchorElem={editorInnerElem} />}
        </div>
      </div>
    </div>
  );
}

interface LexicalEditorProps {
  tripId?: string;
  initialContent?: Trip["content"];
}

export default function LexicalEditor({ tripId, initialContent }: LexicalEditorProps) {
  // Lexical only applies `$initialEditorState` at construction time, so the
  // extension (and the composer below, via `key`) must be rebuilt per trip.
  const editorExtension = useMemo(
    () =>
      defineExtension({
        name: "LunoEditor/root",
        ...editorConfig,
        $initialEditorState: getInitialEditorState(initialContent),
        dependencies: [
          ...editorExtensionDependencies,
          configExtension(ReactExtension, { EditorChildrenComponent: EditorLayout }),
        ],
      }),
    [initialContent],
  );

  return (
    <LexicalExtensionComposer
      key={tripId}
      extension={editorExtension}
      contentEditable={
        <ContentEditable
          className={styles.contentEditable}
        />
      }
    >
      <Toolbar tripId={tripId} />
    </LexicalExtensionComposer>
  );
}
