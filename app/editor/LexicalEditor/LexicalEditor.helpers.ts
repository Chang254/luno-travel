import { AutoFocusExtension } from "@lexical/extension";
import { HistoryExtension } from "@lexical/history";
import { ListExtension } from "@lexical/list";
import { RichTextExtension } from "@lexical/rich-text";
import type { InitialEditorConfig } from "lexical";

import { ImageExtension } from "./ImageNode";
import { editorTheme } from "./LexicalEditor.styles";

//TODO: Add true error handling
function onError(error: Error) {
  console.error(error);
}

/** Namespace/theme/error-handling shared by the root editor extension. */
export const editorConfig: InitialEditorConfig = {
  namespace: "LunoEditor",
  theme: editorTheme,
  onError,
};

/**
 * Rich text + undo/redo + lists + autofocus + images. `RichTextExtension`
 * and `ListExtension` already register their own nodes (headings/quotes and
 * lists respectively), so nothing extra needs to be added for those.
 */
export const editorExtensionDependencies = [
  RichTextExtension,
  HistoryExtension,
  ListExtension,
  AutoFocusExtension,
  ImageExtension,
];
