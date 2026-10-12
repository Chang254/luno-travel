import type { EditorThemeClasses } from "lexical";

/** Shared by the editor and the reader so published trips look like the editor. */
export const tripContentStyles = {
  surface: "resize-none py-3 pl-7 pr-4 text-sm bg-white outline-none",
};

/** Maps Lexical's built-in node/format classes to Tailwind strings. */
export const editorTheme: EditorThemeClasses = {
  paragraph: "mb-2",
  heading: {
    h1: "mb-2 text-2xl font-bold",
    h2: "mb-2 text-xl font-bold",
    h3: "mb-2 text-lg font-bold",
  },
  quote: "mb-2 border-l-2 border-muted-foreground pl-3 italic text-muted-foreground",
  list: {
    ul: "mb-2 list-disc pl-6",
    ol: "mb-2 list-decimal pl-6",
    listitem: "mb-1",
  },
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    underlineStrikethrough: "underline line-through",
    code: "rounded bg-muted px-1 py-0.5 font-mono text-xs",
  },
};
