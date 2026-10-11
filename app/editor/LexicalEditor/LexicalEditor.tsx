"use client";

import { configExtension, defineExtension } from "lexical";
import { LexicalExtensionComposer } from "@lexical/react/LexicalExtensionComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import {
  ReactExtension,
  type EditorChildrenComponentProps,
} from "@lexical/react/ReactExtension";

import { Toolbar } from "./Toolbar";
import { editorConfig, editorExtensionDependencies } from "./LexicalEditor.helpers";
import { styles } from "./LexicalEditor.styles";

/** Renders the toolbar above the content-editable surface */
function EditorLayout({ contentEditable, children }: EditorChildrenComponentProps) {
  return (
    <div className={styles.container}>
      {children}
      {contentEditable}
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
