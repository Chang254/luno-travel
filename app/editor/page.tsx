"use client";
import { Suspense } from "react";

import LexicalEditor from './LexicalEditor'
import { EditorHeader } from "./EditorHeader";

export default function EditorPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <EditorHeader />
      <div className="min-h-0 flex-1">
        <Suspense>
          <LexicalEditor />
        </Suspense>
      </div>
    </div>
  );
}
