"use client";

import { useState } from "react";
import { configExtension, defineExtension } from "lexical";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import {
  ReactExtension,
  type EditorChildrenComponentProps,
} from "@lexical/react/ReactExtension";

import { Toolbar } from "./Toolbar";
import DraggableBlockPlugin from "./DraggableBlockPlugin";
import { editorConfig, editorExtensionDependencies } from "./LexicalEditor.helpers";
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

// Module-scoped so the editor isn't recreated on every render.
const editorExtension = defineExtension({
  name: "LunoEditor/root",
  ...editorConfig,
  dependencies: [
    ...editorExtensionDependencies,
    configExtension(ReactExtension, { EditorChildrenComponent: EditorLayout }),
  ],
});

export default function LexicalEditor() {
  return (
    <LexicalExtensionComposer
      extension={editorExtension}
      contentEditable={
        <ContentEditable
          className={styles.contentEditable}
        />
      }
    >
      <Toolbar />
    </LexicalExtensionComposer>
  );
}
