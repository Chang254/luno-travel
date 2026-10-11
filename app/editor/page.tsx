"use client";
import { Suspense } from "react";

import LexicalEditor from './LexicalEditor'
import EditorHeader from "./EditorHeader";
import { styles } from "./editor.styles";

export default function EditorPage() {
  return (
    <div className={styles.editorContainer}>
      <EditorHeader />
      <div className={styles.editorContent}>
        <Suspense>
          <LexicalEditor />
        </Suspense>
      </div>
    </div>
  );
}
