import { AutoFocusExtension } from "@lexical/extension";
import { HistoryExtension } from "@lexical/history";

import { contentExtensionDependencies } from "@/lib/lexical/tripContent";

/** The shared content extensions plus the editing-only undo/redo and autofocus. */
export const editorExtensionDependencies = [
  ...contentExtensionDependencies,
  HistoryExtension,
  AutoFocusExtension,
];
