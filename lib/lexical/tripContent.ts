import { ListExtension } from "@lexical/list";
import { RichTextExtension } from "@lexical/rich-text";
import type { InitialEditorConfig } from "lexical";

import { ImageExtension } from "@/components/ImageNode";
import type { Trip } from "@/server/models/trips.types";

import { editorTheme } from "./tripContent.styles";

//TODO: Add true error handling
function onError(error: Error) {
  console.error(error);
}

/** Namespace/theme/error-handling shared by the editor and the reader. */
export const editorConfig: InitialEditorConfig = {
  namespace: "LunoEditor",
  theme: editorTheme,
  onError,
};

/**
 * Everything needed to render trip content: rich text, lists and images.
 * `RichTextExtension` and `ListExtension` already register their own nodes
 * (headings/quotes and lists respectively), so nothing extra is needed for those.
 */
export const contentExtensionDependencies = [RichTextExtension, ListExtension, ImageExtension];

/** An empty/missing `{}` trip content value isn't a valid Lexical serialized state. */
function hasContent(content: Trip["content"] | undefined): boolean {
  return (
    content !== null &&
    content !== undefined &&
    typeof content === "object" &&
    !Array.isArray(content) &&
    Object.keys(content).length > 0
  );
}

/**
 * JSON string Lexical can parse as `$initialEditorState`, or `undefined` to let
 * Lexical's own default initializer run (it only kicks in when the key is
 * `undefined`, not `null` — an explicit `null` would leave the root childless).
 */
export function getInitialEditorState(content: Trip["content"] | undefined): string | undefined {
  return hasContent(content) ? JSON.stringify(content) : undefined;
}
